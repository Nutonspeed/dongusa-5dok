#!/usr/bin/env node
const { execSync } = require('child_process');

const skipStrict = process.env.SKIP_STRICT_BUILD === '1';

try {
  if (!skipStrict) {
    execSync('next lint --no-cache --max-warnings=0', { stdio: 'inherit' });
    execSync('tsc --noEmit', { stdio: 'inherit' });
  }
  execSync('next build', { stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}
