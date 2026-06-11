/**
 * Railway 部署：靜態站 + DeepSeek API 代理
 * 環境變數：PORT（Railway 自動注入）、DEEPSEEK_API_KEY
 */
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = join(__dirname, 'dist')
const port = Number(process.env.PORT) || 3000

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

async function handleDeepseek(req, res) {
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

  try {
    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model || 'deepseek-chat',
        messages,
        temperature: body.temperature ?? 0.75,
        max_tokens: body.max_tokens ?? 2000,
        response_format: { type: 'json_object' },
      }),
    })

    const text = await upstream.text()
    if (!upstream.ok) {
      return sendJson(res, upstream.status, { error: text.slice(0, 300) })
    }

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(text)
  } catch (e) {
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
  if (req.method === 'POST' && req.url === '/api/deepseek') {
    return handleDeepseek(req, res)
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStatic(req, res)
  }
  sendJson(res, 405, { error: 'Method not allowed' })
}).listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
