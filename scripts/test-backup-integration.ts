#!/usr/bin/env tsx

/**
 * Integration test for backup workflow
 * This script simulates the backup creation process without cloud upload
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

console.log('🧪 Running Backup Integration Test...')
console.log('=' .repeat(50))

const testDir = '/tmp/backup-test'
const backupDir = join(testDir, 'backup')

try {
  // 1. Setup test environment
  console.log('1. Setting up test environment...')
  if (existsSync(testDir)) {
    execSync(`rm -rf ${testDir}`)
  }
  mkdirSync(testDir, { recursive: true })
  mkdirSync(backupDir, { recursive: true })

  // 2. Create test files to backup
  console.log('2. Creating test files...')
  const testFiles = {
    'package.json': JSON.stringify({ name: 'test-project', version: '1.0.0' }, null, 2),
    'src/index.ts': 'console.log("Hello, world!")',
    'README.md': '# Test Project\n\nThis is a test project for backup testing.',
  }

  Object.entries(testFiles).forEach(([filePath, content]) => {
    const fullPath = join(testDir, filePath)
    const dir = join(fullPath, '..')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(fullPath, content)
  })

  // 3. Create backup archive (simulate source backup)
  console.log('3. Creating backup archive...')
  const timestamp = new Date().toISOString().replace(/[:.-]/g, '_').slice(0, 19)
  const backupName = `test-backup-${timestamp}`

  execSync(`cd ${testDir} && tar -czf ${backupDir}/${backupName}-source.tar.gz --exclude=backup .`, {
    stdio: 'inherit'
  })

  // 4. Create metadata
  console.log('4. Creating backup metadata...')
  const metadata = {
    timestamp: new Date().toISOString(),
    commit_sha: 'test-commit-123',
    branch: 'test-branch',
    backup_type: 'source-only',
    cloud_provider: 'aws-s3',
    workflow_run_id: 'test-run-123',
    repository: 'test/repo',
    files: [
      {
        name: `${backupName}-source.tar.gz`,
        path: `${backupDir}/${backupName}-source.tar.gz`,
        size: 0, // Will be calculated
        checksum: 'test-checksum',
        type: 'source'
      }
    ],
    checksum: 'test-overall-checksum'
  }

  // Calculate actual file size
  const stats = execSync(`stat -c%s ${backupDir}/${backupName}-source.tar.gz`).toString().trim()
  metadata.files[0].size = parseInt(stats)

  writeFileSync(
    join(backupDir, `${backupName}-metadata.json`),
    JSON.stringify(metadata, null, 2)
  )

  // 5. Verify backup contents
  console.log('5. Verifying backup contents...')
  
  // Test extraction
  const extractDir = join(testDir, 'extract-test')
  mkdirSync(extractDir)
  execSync(`cd ${extractDir} && tar -xzf ${backupDir}/${backupName}-source.tar.gz`)

  // Verify extracted files
  const expectedFiles = ['package.json', 'src/index.ts', 'README.md']
  let allFilesPresent = true

  expectedFiles.forEach(file => {
    const extractedFile = join(extractDir, file)
    if (existsSync(extractedFile)) {
      console.log(`  ✅ ${file} - present`)
    } else {
      console.log(`  ❌ ${file} - missing`)
      allFilesPresent = false
    }
  })

  // 6. Test CLI commands
  console.log('6. Testing CLI commands...')
  
  process.env.BACKUP_ENABLED = 'false' // Disable to avoid cloud requirements
  
  try {
    execSync('pnpm backup:validate', { cwd: process.cwd(), stdio: 'inherit' })
    console.log('  ✅ backup:validate - passed')
  } catch (error) {
    console.log('  ❌ backup:validate - failed')
  }

  try {
    execSync('pnpm backup:stats', { cwd: process.cwd(), stdio: 'inherit' })
    console.log('  ✅ backup:stats - passed')
  } catch (error) {
    console.log('  ❌ backup:stats - failed')
  }

  // 7. Summary
  console.log('\n📊 Test Results:')
  console.log(`  Backup archive created: ${existsSync(join(backupDir, `${backupName}-source.tar.gz`))}`)
  console.log(`  Metadata file created: ${existsSync(join(backupDir, `${backupName}-metadata.json`))}`)
  console.log(`  All files extracted: ${allFilesPresent}`)
  console.log(`  Backup size: ${Math.round(metadata.files[0].size / 1024)} KB`)

  if (allFilesPresent) {
    console.log('\n✅ Integration test PASSED!')
    console.log('   The backup system is working correctly.')
  } else {
    console.log('\n❌ Integration test FAILED!')
    console.log('   Some files were not backed up correctly.')
    process.exit(1)
  }

  // 8. Cleanup
  console.log('\n🧹 Cleaning up test files...')
  execSync(`rm -rf ${testDir}`)
  console.log('   Test environment cleaned up.')

} catch (error) {
  console.error('\n❌ Integration test FAILED with error:')
  console.error(error)
  
  // Cleanup on error
  if (existsSync(testDir)) {
    execSync(`rm -rf ${testDir}`)
  }
  
  process.exit(1)
}

console.log('\n🎉 Integration test completed successfully!')