#!/usr/bin/env node
const { execSync } = require('child_process');

if (process.env.ALLOW_PROTECTED_DELETIONS === '1') {
  process.exit(0);
}

const protectedDirs = ['app/', 'components/', 'styles/', 'public/'];

const diff = execSync('git diff --cached --name-status', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

const deletions = diff.filter((line) => {
  const [status, file] = line.split(/\s+/);
  return status === 'D' && protectedDirs.some((dir) => file.startsWith(dir));
});

if (deletions.length > 0) {
  console.error('Commit aborted: deletions detected in protected directories:\n' + deletions.join('\n'));
  process.exit(1);
}
