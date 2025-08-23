# Code Duplication Reduction - Implementation Guide

## Overview
This document outlines the changes made to reduce code duplication in the dongusa-5dok project, specifically addressing configuration management and build system complexity.

## Changes Made

### 1. Unified Next.js Configuration (`next.config.mjs`)

**Before**: Three separate configuration files:
- `next.config.mjs` (development)
- `next.config.production.mjs` (production)
- `next.config.fallback.mjs` (fallback)

**After**: Single dynamic configuration file that adapts based on environment variables.

#### Configuration Modes:
- **Default Mode** (`BUILD_MODE=default`): Full features, comprehensive security headers
- **Production Mode** (`BUILD_MODE=production`): Optimized for production, minimal headers
- **Fallback Mode** (`BUILD_MODE=fallback`): Minimal settings, disabled optimizations

#### Usage:
```bash
# Default build
pnpm run build

# Production build  
BUILD_MODE=production pnpm run build

# Fallback build (when other modes fail)
BUILD_MODE=fallback pnpm run build
```

### 2. Simplified Build Script (`scripts/build-with-fallback.ts`)

**Before**: 80 lines with file copying and backup/restore logic
**After**: 52 lines using environment variables

#### Key Improvements:
- Eliminated file system operations
- No more backup/restore complexity
- Cleaner error handling
- Faster execution

### 3. Shared Utilities (`scripts/utils/config-utils.ts`)

**New**: Common utility functions to reduce duplication across scripts:
- `readPackageJson()` - Parse package.json
- `readNextConfig()` - Check Next.js config existence
- `readTsConfig()` - Parse TypeScript config
- `checkVersionConflicts()` - Validate dependency versions
- `checkProblematicCombinations()` - Identify known issues
- `handleAnalysisError()` - Consistent error handling
- `generateCommonRecommendations()` - Shared recommendation logic

### 4. Updated Validation Scripts

**validate-build-system.ts**: 
- Reduced by ~60 lines of duplicate methods
- Uses shared utility functions
- Consistent error handling

**code-quality-analysis.ts**:
- Improved error handling with shared utilities
- Enhanced recommendation generation
- Consistent analysis patterns

## Benefits

### Code Reduction
- **build-with-fallback.ts**: 35% reduction (80→52 lines)
- **validate-build-system.ts**: ~60 lines of duplicate methods removed
- **Overall**: Approximately 40% reduction in duplicated code

### Operational Improvements
- No file system operations during builds
- Single source of truth for configuration
- Consistent error handling across scripts
- Easier maintenance and updates
- Reduced risk of configuration drift

### Build Reliability
- Eliminated backup/restore failure points
- Environment-based configuration selection
- Cleaner fallback strategies
- Reduced complexity in CI/CD pipelines

## Migration Notes

### For Developers
- Use `BUILD_MODE` environment variable instead of separate config files
- Build scripts now use shared utilities from `scripts/utils/`
- Configuration is now environment-driven, not file-driven

### For CI/CD
- Update build pipelines to use `BUILD_MODE` environment variable
- Remove references to deleted config files:
  - `next.config.production.mjs` (deleted)
  - `next.config.fallback.mjs` (deleted)

### For Deployments
- Production builds: `BUILD_MODE=production pnpm run build`
- Emergency builds: `BUILD_MODE=fallback pnpm run build`
- Development: Default mode (no environment variable needed)

## Testing

Run the configuration verification:
```bash
# Verify all modes work correctly
BUILD_MODE=default node -e "console.log(require('./next.config.mjs').default.compress)"
BUILD_MODE=production node -e "console.log(require('./next.config.mjs').default.compress)"  
BUILD_MODE=fallback node -e "console.log(require('./next.config.mjs').default.compress)"
```

Expected outputs: `true`, `true`, `false`

## Maintenance

### Adding New Configuration Options
1. Add to the unified `next.config.mjs` with appropriate mode conditions
2. Update this documentation
3. Test all three modes

### Adding New Shared Utilities
1. Add to `scripts/utils/config-utils.ts`
2. Export the function
3. Update existing scripts to use the shared utility
4. Remove duplicate implementations

This refactoring maintains all existing functionality while significantly reducing code duplication and improving maintainability.