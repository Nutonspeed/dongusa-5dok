// Fail-fast script for unsupported Node versions during build
const semver = process.version.replace(/^v/, '');
const major = parseInt(semver.split('.')[0], 10);
// Allow Node 18, 19, 20 (avoid bleeding-edge Node 22+ that may break native compiled deps)
if (isNaN(major) || major < 18 || major > 20) {
  console.error(`\nERROR: Unsupported Node.js version detected: v${semver}\n` +
    'This project supports Node.js 18.x - 20.x for local builds. Please install a supported Node version and retry.\n' +
    'Recommended: use nvm (https://github.com/nvm-sh/nvm) or nvm-windows to switch Node versions.\n');
  process.exit(1);
}
process.exit(0);
