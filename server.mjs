/**
 * Railway 部署：靜態站 + DeepSeek API 代理
 * 環境變數：PORT（Railway 自動注入）、DEEPSEEK_API_KEY
 */
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = join(__dirname, 'dist')
const port = Number(process.env.PORT) || 3000
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 20
const aiCache = new Map()
const rateBuckets = new Map()
const usageLogs = []
const errorLogs = []

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 1_000_000) {
        reject(new Error('Body too large'))
        req.destroy()
      }
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim()
  return req.socket.remoteAddress || 'unknown'
}

function hashPayload(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function remember(list, item, max = 200) {
  list.unshift(item)
  if (list.length > max) list.pop()
}

function checkRateLimit(req) {
  const ip = clientIp(req)
  const now = Date.now()
  const bucket = rateBuckets.get(ip)
  if (!bucket || now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { start: now, count: 1 })
    return { ok: true, ip }
  }
  bucket.count += 1
  if (bucket.count > RATE_LIMIT_MAX) {
    return { ok: false, ip, retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.start)) / 1000) }
  }
  return { ok: true, ip }
}

async function handleDeepseek(req, res) {
  const rate = checkRateLimit(req)
  if (!rate.ok) {
    res.setHeader('Retry-After', String(rate.retryAfter))
    remember(usageLogs, { at: new Date().toISOString(), endpoint: '/api/deepseek', ip: rate.ip, ok: false, status: 429 })
    return sendJson(res, 429, { error: `請求過於頻繁，請約 ${rate.retryAfter} 秒後再試` })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return sendJson(res, 500, { error: '伺服器未設定 DEEPSEEK_API_KEY' })
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch (e) {
    return sendJson(res, 400, { error: e instanceof Error ? e.message : 'Invalid body' })
  }

  const messages = body.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return sendJson(res, 400, { error: '缺少 messages' })
  }

  const cacheKey = hashPayload({
    model: body.model || 'deepseek-chat',
    messages,
    temperature: body.temperature ?? 0.75,
    max_tokens: body.max_tokens ?? 2000,
    response_format: body.response_format,
  })
  const cached = aiCache.get(cacheKey)
  if (cached && Date.now() - cached.createdAt < 24 * 60 * 60 * 1000) {
    remember(usageLogs, { at: new Date().toISOString(), endpoint: '/api/deepseek', ip: rate.ip, ok: true, status: 200, cached: true })
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-AI-Cache': 'HIT' })
    res.end(cached.text)
    return
  }

  try {
    const upstreamPayload = {
      model: body.model || 'deepseek-chat',
      messages,
      temperature: body.temperature ?? 0.75,
      max_tokens: body.max_tokens ?? 2000,
      ...(body.response_format ? { response_format: body.response_format } : {}),
    }

    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(upstreamPayload),
    })

    const text = await upstream.text()
    if (!upstream.ok) {
      remember(errorLogs, { at: new Date().toISOString(), endpoint: '/api/deepseek', status: upstream.status, error: text.slice(0, 300) })
      remember(usageLogs, { at: new Date().toISOString(), endpoint: '/api/deepseek', ip: rate.ip, ok: false, status: upstream.status })
      return sendJson(res, upstream.status, { error: text.slice(0, 300) })
    }

    aiCache.set(cacheKey, { text, createdAt: Date.now() })
    if (aiCache.size > 300) aiCache.delete(aiCache.keys().next().value)
    let usage
    try {
      usage = JSON.parse(text)?.usage
    } catch {
      usage = undefined
    }
    remember(usageLogs, { at: new Date().toISOString(), endpoint: '/api/deepseek', ip: rate.ip, ok: true, status: 200, cached: false, usage })
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-AI-Cache': 'MISS' })
    res.end(text)
  } catch (e) {
    remember(errorLogs, { at: new Date().toISOString(), endpoint: '/api/deepseek', status: 500, error: e instanceof Error ? e.message : 'Proxy error' })
    remember(usageLogs, { at: new Date().toISOString(), endpoint: '/api/deepseek', ip: rate.ip, ok: false, status: 500 })
    sendJson(res, 500, { error: e instanceof Error ? e.message : 'Proxy error' })
  }
}

function safePath(urlPath) {
  const normalized = join(distDir, urlPath.replace(/^\/+/, ''))
  if (!normalized.startsWith(distDir)) return null
  return normalized
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)

  if (urlPath !== '/' && !urlPath.includes('..')) {
    const filePath = safePath(urlPath)
    if (filePath && existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = extname(filePath)
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      createReadStream(filePath).pipe(res)
      return
    }
  }

  const indexPath = join(distDir, 'index.html')
  if (!existsSync(indexPath)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('尚未 build，請先執行 npm run build')
    return
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  createReadStream(indexPath).pipe(res)
}

createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname

  if (req.method === 'POST' && pathname === '/api/deepseek') {
    return handleDeepseek(req, res)
  }
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, {
      ok: true,
      cacheSize: aiCache.size,
      usage: usageLogs.slice(0, 25),
      errors: errorLogs.slice(0, 25),
    })
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStatic(req, res)
  }
  sendJson(res, 405, { error: 'Method not allowed' })
}).listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
