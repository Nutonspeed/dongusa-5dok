# Production Deployment Test Guide

## Overview

This guide provides comprehensive instructions for testing and validating the production deployment of the sofa cover website.

## Quick Start

\`\`\`bash
# Run complete deployment test suite
npm run deploy:test

# Or run individual components
npm run deploy:pre-validate    # Pre-deployment validation
npm run build:fallback         # Build with fallback strategy
npm run deploy:post-validate   # Post-deployment validation
\`\`\`

## Test Components

### 1. Pre-Deployment Validation

**Script:** `scripts/pre-deployment-validation.ts`

**What it tests:**
- Package.json integrity and dependencies
- Next.js configuration syntax
- Environment variables
- TypeScript compilation
- ESLint validation
- Build process

**Usage:**
\`\`\`bash
npm run deploy:pre-validate
\`\`\`

### 2. Build with Fallback Strategy

**Script:** `scripts/build-with-fallback.ts`

**What it does:**
- Attempts build with default configuration
- Falls back to production-optimized config if needed
- Uses minimal fallback config as last resort
- Provides detailed error reporting

**Usage:**
\`\`\`bash
npm run build:fallback
\`\`\`

### 3. Post-Deployment Validation

**Script:** `scripts/post-deployment-validation.ts`

**What it tests:**
- Homepage accessibility
- API health endpoints
- Database connectivity
- Admin interface
- Static asset delivery

**Usage:**
\`\`\`bash
# Test local deployment
npm run deploy:post-validate

# Test specific URL
npm run deploy:post-validate https://your-domain.com
\`\`\`

### 4. Complete Test Suite

**Script:** `scripts/execute-deployment-test.ts`

**What it includes:**
- All validation steps
- Security configuration tests
- Performance checks
- Detailed reporting

**Usage:**
\`\`\`bash
tsx scripts/execute-deployment-test.ts
\`\`\`

## Environment Variables Required

### Critical (Must be set)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Optional (For full functionality)
- `DATABASE_URL`
- `REDIS_URL`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`

## Troubleshooting

### Common Issues

1. **Lockfile Mismatch**
   \`\`\`bash
   # Fix with deployment script
   npm run deploy:fix
   \`\`\`

2. **Build Failures**
   \`\`\`bash
   # Use fallback build strategy
   npm run build:fallback
   \`\`\`

3. **Environment Variables**
   \`\`\`bash
   # Validate environment setup
   npm run test:env
   \`\`\`

### Deployment Fixes Applied

1. **Package Management**
   - Updated `vercel.json` to use `--no-frozen-lockfile`
   - Added `.npmrc` for better dependency resolution
   - Created deployment fix script

2. **Build Configuration**
   - Multiple fallback configurations
   - Relaxed security headers for compatibility
   - Optimized image handling

3. **Validation Pipeline**
   - Pre and post-deployment checks
   - Health monitoring endpoints
   - Automated error reporting

## Success Criteria

### Pre-Deployment
- ✅ No critical package issues
- ✅ Valid Next.js configuration
- ✅ Successful build completion
- ✅ Environment variables present

### Post-Deployment
- ✅ Homepage loads (200 status)
- ✅ API health endpoints respond
- ✅ Database connectivity confirmed
- ✅ Admin interface accessible

## Monitoring

After successful deployment, monitor:

1. **Health Endpoints**
   - `/api/health` - General system health
   - `/api/health/database` - Database connectivity
   - `/api/health/supabase` - Supabase services

2. **Performance Metrics**
   - Page load times
   - API response times
   - Error rates

3. **Security**
   - Failed login attempts
   - Unusual traffic patterns
   - Security header compliance

## Support

If deployment tests fail:

1. Check the generated `deployment-test-report.json`
2. Review error logs in the console output
3. Verify environment variables are correctly set
4. Ensure all integrations are properly configured

For persistent issues, the system includes comprehensive logging and monitoring to help identify root causes.
