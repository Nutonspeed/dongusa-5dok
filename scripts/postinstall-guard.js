// Lightweight guard for postinstall to avoid running heavy setup in production or CI
const { execSync } = require('child_process')

const nodeEnv = process.env.NODE_ENV || 'development'
const ci = process.env.CI || process.env.GITHUB_ACTIONS || process.env.VERCEL

if (nodeEnv === 'production' || ci) {
  console.log('postinstall: production/CI detected — skipping dev setup')
  process.exit(0)
}

console.log('postinstall: running dev setup (non-production)')
try {
  execSync('pnpm run dev:setup', { stdio: 'inherit' })
} catch (err) {
  console.error('postinstall: dev setup failed', err)
  process.exit(1)
}
