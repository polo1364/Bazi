import { createServer } from 'vite'

export async function createSsrTestServer(cacheName) {
  return createServer({
    cacheDir: `node_modules/.vite-${cacheName}`,
    logLevel: 'error',
    optimizeDeps: { entries: [], noDiscovery: true },
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
  })
}
