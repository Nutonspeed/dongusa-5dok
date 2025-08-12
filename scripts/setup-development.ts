import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs"
import { join } from "path"

export const runtime = 'nodejs'

interface SetupStep {
  name: string
  description: string
  action: () => Promise<void> | void
  required: boolean
}

const logger = {
  info: (message: string, ...args: any[]) => console.log(`ℹ️ ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`⚠️ ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`❌ ${message}`, ...args),
  success: (message: string, ...args: any[]) => console.log(`✅ ${message}`, ...args),
  group: (message: string) => console.group(`📁 ${message}`),
  groupEnd: () => console.groupEnd(),
}

const SETUP_STEPS: SetupStep[] = [
  {
    name: "Environment Files",
    description: "Create development environment configuration",
    required: true,
    action: async () => {
      // Create .env.local if it doesn't exist
      if (!existsSync(".env.local")) {
        const envLocal = `# ===========================================
# 🔧 LOCAL DEVELOPMENT CONFIGURATION
# ===========================================

NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Development Database (Mock)
NEXT_PUBLIC_USE_SUPABASE=false
ENABLE_MOCK_SERVICES=true

# Development Auth
QA_BYPASS_AUTH=1
SKIP_EMAIL_VERIFICATION=true
NEXTAUTH_SECRET=development-secret-key-minimum-32-characters-long

# Development Features
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEBUG_MODE=true
ENABLE_TEST_ROUTES=true

# Build Configuration
SKIP_STRICT_BUILD=true
ALLOW_PROTECTED_DELETIONS=true

# Mock Services
MOCK_EMAIL_ENABLED=true
MOCK_UPLOAD_ENABLED=true
MOCK_PAYMENT_ENABLED=true

# Development Logging
LOG_LEVEL=debug
ENABLE_PERFORMANCE_MONITORING=false

# Business Information (Update these)
STORE_NAME="ร้านผ้าคลุมโซฟาพรีเมียม"
STORE_PHONE="02-123-4567"
STORE_LINE_ID="@sofacover"
ADMIN_EMAIL=admin@localhost

# Feature Flags (Development)
ENABLE_CUSTOM_COVERS=true
ENABLE_BULK_ORDERS=true
ENABLE_REVIEWS=true
ENABLE_WISHLIST=true
ENABLE_ADVANCED_ANALYTICS=true
ENABLE_BULK_OPERATIONS=true
ENABLE_EXPORT_FEATURES=true

# Localization
NEXT_PUBLIC_DEFAULT_LOCALE=th
NEXT_PUBLIC_SUPPORTED_LOCALES=th,en
NEXT_PUBLIC_DEFAULT_CURRENCY=THB
NEXT_PUBLIC_CURRENCY_SYMBOL=฿

# Upload Configuration
MAX_FILE_SIZE=5242880
MAX_FILES_PER_UPLOAD=10
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif
IMAGE_QUALITY=80
THUMBNAIL_SIZE=200
MEDIUM_SIZE=800
LARGE_SIZE=1200

# Shipping Configuration
FREE_SHIPPING_THRESHOLD=2000
STANDARD_SHIPPING_RATE=100
EXPRESS_SHIPPING_RATE=200

# Business Hours
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=18:00
BUSINESS_DAYS=1,2,3,4,5,6

# Inventory
LOW_STOCK_THRESHOLD=10
AUTO_REORDER_ENABLED=true
`
        writeFileSync(".env.local", envLocal)
        logger.success("Created .env.local for development")
      } else {
        logger.info(".env.local already exists")
      }
    },
  },

  {
    name: "Git Configuration",
    description: "Configure Git to ignore sensitive files",
    required: true,
    action: async () => {
      let gitignore = ""

      if (existsSync(".gitignore")) {
        gitignore = readFileSync(".gitignore", "utf-8")
      }

      const requiredEntries = [
        "",
        "# Environment files",
        ".env.local",
        ".env.production",
        ".env*.local",
        "",
        "# Development files",
        ".vscode/settings.json",
        ".idea/",
        "*.log",
        "logs/",
        "",
        "# Database",
        "*.db",
        "*.sqlite",
        "",
        "# Uploads",
        "/uploads",
        "/temp",
        "/public/uploads",
        "",
        "# Cache",
        ".cache/",
        "*.tsbuildinfo",
        "",
        "# OS generated files",
        ".DS_Store",
        ".DS_Store?",
        "._*",
        ".Spotlight-V100",
        ".Trashes",
        "ehthumbs.db",
        "Thumbs.db",
      ]

      let updated = false
      for (const entry of requiredEntries) {
        if (!gitignore.includes(entry.trim())) {
          gitignore += entry + "\n"
          updated = true
        }
      }

      if (updated) {
        writeFileSync(".gitignore", gitignore)
        logger.success("Updated .gitignore")
      } else {
        logger.info(".gitignore already configured")
      }
    },
  },

  {
    name: "Development Scripts",
    description: "Add helpful development scripts to package.json",
    required: false,
    action: async () => {
      const packageJsonPath = "package.json"
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"))

        const devScripts = {
          "dev:setup": "tsx scripts/setup-development.ts",
          "dev:validate": "tsx lib/environment-validator.ts",
          "dev:reset": "tsx scripts/reset-development.ts",
          "dev:mock": "ENABLE_MOCK_SERVICES=true npm run dev",
          "dev:supabase": "NEXT_PUBLIC_USE_SUPABASE=true npm run dev",
          "db:setup": "tsx scripts/setup-database.ts",
          "db:seed": "tsx scripts/seed-database.ts",
          "db:reset": "tsx scripts/reset-database.ts",
          "build:analyze": "ANALYZE=true npm run build",
          "build:production": "NODE_ENV=production NEXT_PUBLIC_USE_SUPABASE=true npm run build",
          "test:env": "tsx lib/environment-validator.ts",
          clean: "rm -rf .next out dist",
          "clean:all": "rm -rf .next out dist node_modules package-lock.json",
        }

        let updated = false
        for (const [script, command] of Object.entries(devScripts)) {
          if (!packageJson.scripts[script]) {
            packageJson.scripts[script] = command
            updated = true
          }
        }

        if (updated) {
          writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
          logger.success("Added development scripts to package.json")
        } else {
          logger.info("Development scripts already exist")
        }
      }
    },
  },

  {
    name: "VSCode Configuration",
    description: "Create VSCode workspace settings",
    required: false,
    action: async () => {
      const vscodeDir = ".vscode"
      const settingsPath = join(vscodeDir, "settings.json")
      const extensionsPath = join(vscodeDir, "extensions.json")

      if (!existsSync(vscodeDir)) {
        mkdirSync(vscodeDir)
      }

      // VSCode Settings
      if (!existsSync(settingsPath)) {
        const settings = {
          "typescript.preferences.importModuleSpecifier": "relative",
          "editor.formatOnSave": true,
          "editor.codeActionsOnSave": {
            "source.fixAll.eslint": "explicit",
            "source.organizeImports": "explicit",
          },
          "files.associations": {
            "*.env*": "dotenv",
          },
          "emmet.includeLanguages": {
            typescript: "html",
            typescriptreact: "html",
          },
          "tailwindCSS.includeLanguages": {
            typescript: "html",
            typescriptreact: "html",
          },
          "files.exclude": {
            "**/.next": true,
            "**/node_modules": true,
            "**/.git": true,
            "**/*.tsbuildinfo": true,
          },
          "search.exclude": {
            "**/node_modules": true,
            "**/.next": true,
            "**/dist": true,
            "**/out": true,
          },
          "typescript.suggest.autoImports": true,
          "typescript.updateImportsOnFileMove.enabled": "always",
          "editor.tabSize": 2,
          "editor.insertSpaces": true,
          "editor.detectIndentation": false,
          "files.trimTrailingWhitespace": true,
          "files.insertFinalNewline": true,
          "editor.rulers": [80, 120],
          "workbench.colorCustomizations": {
            "editorRuler.foreground": "#333333",
          },
        }

        writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
        logger.success("Created VSCode settings")
      } else {
        logger.info("VSCode settings already exist")
      }

      // VSCode Extensions
      if (!existsSync(extensionsPath)) {
        const extensions = {
          recommendations: [
            "bradlc.vscode-tailwindcss",
            "esbenp.prettier-vscode",
            "dbaeumer.vscode-eslint",
            "ms-vscode.vscode-typescript-next",
            "formulahendry.auto-rename-tag",
            "christian-kohler.path-intellisense",
            "ms-vscode.vscode-json",
            "mikestead.dotenv",
            "bradlc.vscode-tailwindcss",
            "usernamehw.errorlens",
            "gruntfuggly.todo-tree",
            "streetsidesoftware.code-spell-checker",
          ],
        }

        writeFileSync(extensionsPath, JSON.stringify(extensions, null, 2))
        logger.success("Created VSCode extensions recommendations")
      } else {
        logger.info("VSCode extensions already exist")
      }
    },
  },

  {
    name: "Development Directories",
    description: "Create necessary directories for development",
    required: false,
    action: async () => {
      const directories = ["logs", "temp", "public/uploads", "scripts", "docs", "tests", "__tests__"]

      for (const dir of directories) {
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true })
          logger.success(`Created directory: ${dir}`)
        }
      }
    },
  },

  {
    name: "Development Database",
    description: "Initialize mock database with sample data",
    required: false,
    action: async () => {
      try {
        // Create a simple mock data file
        const mockDataPath = "lib/mock-data.json"
        if (!existsSync(mockDataPath)) {
          const mockData = {
            customers: [
              {
                id: "1",
                name: "ลูกค้าทดสอบ",
                email: "test@example.com",
                phone: "02-123-4567",
                created_at: new Date().toISOString(),
              },
            ],
            products: [
              {
                id: "1",
                name: "ผ้าคลุมโซฟา 3 ที่นั่ง",
                price: 1500,
                category: "sofa-covers",
                in_stock: true,
                stock_quantity: 50,
              },
            ],
            orders: [],
            bills: [],
          }

          writeFileSync(mockDataPath, JSON.stringify(mockData, null, 2))
          logger.success("Created mock database with sample data")
        } else {
          logger.info("Mock database already exists")
        }
      } catch (error) {
        logger.warn("Could not initialize mock database:", error)
      }
    },
  },

  {
    name: "Development Documentation",
    description: "Create development documentation",
    required: false,
    action: async () => {
      const readmePath = "docs/DEVELOPMENT.md"
      if (!existsSync("docs")) {
        mkdirSync("docs", { recursive: true })
      }

      if (!existsSync(readmePath)) {
        const readme = `# Development Guide

## Quick Start

1. **Setup Environment**
   \`\`\`bash
   npm run dev:setup
   \`\`\`

2. **Validate Configuration**
   \`\`\`bash
   npm run dev:validate
   \`\`\`

3. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run dev:mock\` - Start with mock services
- \`npm run dev:supabase\` - Start with Supabase
- \`npm run dev:validate\` - Validate environment
- \`npm run build:production\` - Build for production

## Environment Configuration

Copy \`.env.example\` to \`.env.local\` and update the values:

### Required for Development
- \`NODE_ENV=development\`
- \`NEXTAUTH_SECRET\` - Any 32+ character string
- \`NEXT_PUBLIC_SITE_URL\` - Usually http://localhost:3000

### Optional for Development
- \`NEXT_PUBLIC_USE_SUPABASE=false\` - Use mock database
- \`QA_BYPASS_AUTH=1\` - Skip authentication
- \`ENABLE_MOCK_SERVICES=true\` - Use mock services

## Database

### Mock Database (Default)
- No setup required
- Uses local JSON files
- Perfect for development

### Supabase Database
1. Create Supabase project
2. Set environment variables:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - \`SUPABASE_SERVICE_ROLE_KEY\`
3. Run database setup: \`npm run db:setup\`

## Troubleshooting

### Common Issues

1. **Environment Variables**
   - Run \`npm run test:env\` to check configuration
   - Copy \`.env.example\` to \`.env.local\`

2. **Database Connection**
   - Check Supabase credentials
   - Or disable with \`NEXT_PUBLIC_USE_SUPABASE=false\`

3. **Build Errors**
   - Run \`npm run clean\` and try again
   - Check TypeScript errors with \`npm run type-check\`

### Getting Help

1. Check the logs in the console
2. Run validation: \`npm run dev:validate\`
3. Check environment: \`npm run test:env\`
`

        writeFileSync(readmePath, readme)
        logger.success("Created development documentation")
      } else {
        logger.info("Development documentation already exists")
      }
    },
  },
]

async function setupDevelopment() {
  logger.group("Development Environment Setup")

  let completed = 0
  let failed = 0

  for (const step of SETUP_STEPS) {
    logger.info(`Setting up: ${step.name}`)
    logger.info(`Description: ${step.description}`)

    try {
      await step.action()
      completed++
      logger.success(`${step.name} completed`)
    } catch (error) {
      failed++
      if (step.required) {
        logger.error(`${step.name} failed (required):`, error)
      } else {
        logger.warn(`${step.name} failed (optional):`, error)
      }
    }

    console.log("") // Empty line for readability
  }

  logger.info(`📊 Setup Summary: ${completed} completed, ${failed} failed`)

  if (failed === 0) {
    logger.success("🎉 Development environment setup completed successfully!")
    console.log("")
    logger.info("Next steps:")
    logger.info("1. Review and update .env.local with your specific settings")
    logger.info("2. Run 'npm run dev' to start the development server")
    logger.info("3. Run 'npm run dev:validate' to check your setup")
    logger.info("4. Check docs/DEVELOPMENT.md for detailed instructions")
  } else {
    logger.warn("⚠️ Setup completed with some issues. Please review the errors above.")
  }

  logger.groupEnd()
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDevelopment().catch((error) => {
    console.error("Setup failed:", error)
    process.exit(1)
  })
}

export default setupDevelopment
