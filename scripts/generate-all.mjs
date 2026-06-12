/**
 * 產生所有資料庫
 * 執行: node scripts/generate-all.mjs
 */
import { spawnSync } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const scripts = [
  'generate-strokes.mjs',
  'generate-wuge-luck.mjs',
  'generate-nayin.mjs',
  'generate-jiazi.mjs',
  'generate-solar-terms.mjs',
  'generate-compound-surnames.mjs',
  'generate-char-wuxing.mjs',
  'generate-shensha.mjs',
  'generate-relations.mjs',
  'generate-sancai.mjs',
  'generate-zodiac.mjs',
  'generate-daymaster.mjs',
  'generate-name-meanings.mjs',
  'generate-tengods.mjs',
  'generate-patterns.mjs',
  'generate-wuxing.mjs',
  'generate-stems-branches.mjs',
]

for (const s of scripts) {
  console.log(`\n--- ${s} ---`)
  const r = spawnSync('node', [join(__dirname, s)], { stdio: 'inherit', encoding: 'utf8' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}
console.log('\n✓ All databases generated.')
