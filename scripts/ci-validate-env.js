// Simple CI script to validate critical environment variables and fail fast
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_USE_SUPABASE',
]

let missing = []
for (const k of required) {
  if (!process.env[k]) missing.push(k)
}

if (missing.length > 0) {
  console.error('Missing required env vars:', missing.join(', '))
  process.exit(2)
}

console.log('All required environment variables are present')
process.exit(0)
