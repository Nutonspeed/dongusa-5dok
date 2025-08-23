# Localization Workflow

This repository includes a comprehensive localization workflow that manages translation files and syncs with translation management platforms like Crowdin or Lokalise.

## Overview

The localization system consists of:

- **Translation Files**: JSON files in the `locales/` directory for each supported language
- **Validation Scripts**: Automated validation of translation completeness and integrity
- **Translation Management**: Scripts to sync with external translation platforms
- **GitHub Workflow**: Automated CI/CD for translation management
- **Dynamic Loading**: Runtime loading of translations from files

## Supported Languages

- `th` - Thai (default)
- `en` - English
- `ms` - Malay
- `zh` - Chinese (Simplified)
- `es` - Spanish

## Quick Start

### 1. Validate Translations

```bash
npm run translations:validate
```

This command:
- Checks all translation files for completeness
- Validates JSON syntax
- Ensures all keys are present in all languages
- Reports missing or extra keys

### 2. Generate Translation Report

```bash
npm run translations:report
```

Generates a detailed report showing:
- Translation completion percentage for each language
- Missing translation keys
- Overall translation status

### 3. Test the Workflow

```bash
npm run translations:test
```

Runs a comprehensive test of the entire localization workflow.

## Translation Platform Integration

### Configuration

Edit `localization.config.json` to configure your translation platform:

```json
{
  "translationPlatform": {
    "provider": "crowdin",
    "projectId": "your-project-id",
    "apiToken": "your-api-token",
    "baseBranch": "main"
  }
}
```

### Supported Platforms

#### Crowdin
- Set `provider` to `"crowdin"`
- Configure your project ID and API token
- The workflow will upload source files and download completed translations

#### Lokalise
- Set `provider` to `"lokalise"`
- Configure your project ID and API token
- Similar functionality to Crowdin

### Commands

```bash
# Sync with translation platform (upload + download)
npm run translations:sync

# Upload source files only
npm run translations:upload

# Download completed translations only
npm run translations:download

# Export files for manual platform upload
npm run translations:export
```

## GitHub Actions Workflow

The repository includes a GitHub Actions workflow (`.github/workflows/localization.yml`) that:

### Automatic Triggers
- **On Push**: Validates translations when translation files are modified
- **On Pull Request**: Ensures translation integrity in PRs
- **Daily Schedule**: Syncs with translation platform at 2 AM UTC
- **Manual Trigger**: Allows manual execution with different actions

### Jobs

1. **validate-translations**: Validates all translation files
2. **sync-translations**: Syncs with the translation platform
3. **check-integrity**: Performs integrity checks on translation files
4. **generate-report**: Creates translation completion reports

### Setup

1. Add these secrets to your GitHub repository:
   - `TRANSLATION_PROJECT_ID`: Your translation platform project ID
   - `TRANSLATION_API_TOKEN`: Your translation platform API token

2. The workflow will automatically run on relevant changes

## File Structure

```
├── locales/                          # Translation files
│   ├── th.json                      # Thai (default)
│   ├── en.json                      # English
│   ├── ms.json                      # Malay
│   ├── zh.json                      # Chinese
│   └── es.json                      # Spanish
├── scripts/
│   ├── translation-validator.mjs    # Validation script
│   ├── translation-manager.mjs      # Platform sync script
│   └── test-localization-workflow.mjs # Test script
├── lib/
│   ├── translation-loader.ts        # Dynamic translation loader
│   └── global-expansion-service.ts  # Main localization service
├── localization.config.json         # Configuration file
└── .github/workflows/localization.yml # GitHub Actions workflow
```

## Adding New Translations

### 1. Add to Default Language (Thai)

Edit `locales/th.json` and add your new translation key:

```json
{
  "new.feature.title": "ชื่อฟีเจอร์ใหม่",
  "existing.keys": "..."
}
```

### 2. Add to All Other Languages

Add the same key to all other language files (`en.json`, `ms.json`, `zh.json`, `es.json`).

### 3. Validate

```bash
npm run translations:validate
```

### 4. Sync with Platform

```bash
npm run translations:upload
```

## Translation File Format

Each translation file is a flat JSON object:

```json
{
  "nav.home": "Home",
  "nav.products": "Products",
  "product.addToCart": "Add to Cart",
  "order.status.pending": "Pending",
  "error.network": "Network connection error"
}
```

### Key Naming Convention

- Use dot notation for grouping: `nav.home`, `order.status.pending`
- Use lowercase with dots and underscores
- Maximum key length: 100 characters
- Maximum translation length: 500 characters

## Usage in Code

### In TypeScript/JavaScript

```typescript
import { globalExpansionService } from '@/lib/global-expansion-service'

// Translate using current language
const text = globalExpansionService.translate('nav.home')

// Translate to specific language
const text = globalExpansionService.translate('nav.home', 'en')

// Reload translations (useful after updates)
globalExpansionService.reloadTranslations()
```

### Getting Available Languages

```typescript
const languages = globalExpansionService.getSupportedLanguages()
// Returns: ['th', 'en', 'ms', 'zh', 'es']
```

## Validation Rules

The validation system checks for:

- **File Existence**: All language files must exist
- **JSON Validity**: All files must be valid JSON
- **Key Completeness**: All keys from the default language must exist in all languages
- **Key Format**: Keys must follow naming conventions
- **Content Validation**: No empty translations
- **Length Limits**: Keys and translations within configured limits

## Monitoring and Reports

### Translation Report

Generated reports include:
- Total number of translation keys
- Completion percentage per language
- Missing translation keys
- Translation quality metrics

### GitHub Actions Artifacts

The workflow uploads:
- Translation validation reports
- Translation completion reports
- Error logs and warnings

## Troubleshooting

### Common Issues

1. **"Translation file not found"**
   - Ensure all language files exist in `locales/` directory
   - Check file names match supported locales

2. **"Invalid JSON"**
   - Validate JSON syntax in your translation files
   - Use a JSON validator or `npm run translations:validate`

3. **"Missing translation keys"**
   - Add missing keys to incomplete language files
   - Use the validation report to identify missing keys

4. **Platform sync failures**
   - Check your API credentials in GitHub secrets
   - Verify project ID is correct
   - Ensure the translation platform is accessible

### Debug Commands

```bash
# Detailed validation with warnings
npm run translations:validate

# Test the entire workflow
npm run translations:test

# Generate a detailed report
npm run translations:report
```

## Best Practices

1. **Always validate** translations before committing
2. **Use descriptive keys** that clearly indicate the context
3. **Keep translations short** and concise when possible
4. **Test in all languages** to ensure UI layout works
5. **Regular syncing** with the translation platform
6. **Review automated translations** before deploying
7. **Use the validation reports** to track translation quality

## Contributing

When contributing translations:

1. Follow the key naming conventions
2. Ensure all languages are updated
3. Run validation before submitting PRs
4. Test the changes in the application
5. Update documentation if adding new features