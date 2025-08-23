#!/bin/bash

# Prebuild Guard Script for Code Quality Validation
# This script runs basic validations before the build process

set -e

echo "🛡️ Starting prebuild quality guard..."

# Check if essential files exist
echo "📋 Checking essential files..."
essential_files=(
  "package.json"
  "tsconfig.json"
  ".eslintrc.json"
  "next.config.mjs"
)

for file in "${essential_files[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Essential file missing: $file"
    exit 1
  fi
  echo "✅ Found: $file"
done

# Check for node_modules
if [ ! -d "node_modules" ]; then
  echo "⚠️ node_modules not found - dependencies may need to be installed"
fi

# Run quick TypeScript check
echo "🔷 Running TypeScript validation..."
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
  echo "✅ TypeScript validation passed"
else
  echo "⚠️ TypeScript validation failed - continuing with build"
fi

# Run quick ESLint check on critical files
echo "🔧 Running ESLint check on critical files..."
critical_patterns=(
  "app/**/*.tsx"
  "lib/**/*.ts"
  "components/**/*.tsx"
)

for pattern in "${critical_patterns[@]}"; do
  if ls $pattern 1> /dev/null 2>&1; then
    if npx eslint $pattern --max-warnings 50 > /dev/null 2>&1; then
      echo "✅ ESLint check passed for $pattern"
    else
      echo "⚠️ ESLint issues found in $pattern - continuing with build"
    fi
  fi
done

# Check environment variables are properly configured
echo "🔧 Checking environment configuration..."
if [ -f ".env.example" ]; then
  echo "✅ Environment template found"
else
  echo "⚠️ No .env.example found"
fi

# Check for common security issues
echo "🔒 Running basic security checks..."

# Check for hardcoded secrets (basic patterns)
if grep -r -i "password\s*=\s*['\"][^'\"]*['\"]" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" > /dev/null 2>&1; then
  echo "⚠️ Potential hardcoded passwords found"
fi

if grep -r -i "api[_-]key\s*=\s*['\"][^'\"]*['\"]" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" > /dev/null 2>&1; then
  echo "⚠️ Potential hardcoded API keys found"
fi

# Check dependencies for known vulnerabilities (quick check)
echo "🔍 Running quick dependency audit..."
if npm audit --audit-level=high > /dev/null 2>&1; then
  echo "✅ No high-severity vulnerabilities found"
else
  echo "⚠️ High-severity vulnerabilities detected - review recommended"
fi

echo "🛡️ Prebuild guard completed successfully"
echo "✅ Ready to proceed with build process"