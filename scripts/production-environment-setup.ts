import "server-only"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"

const execAsync = promisify(exec)

interface EnvironmentConfig {
  name: string
  required: boolean
  description: string
  defaultValue?: string
  validation?: (value: string) => boolean
}

class ProductionEnvironmentSetup {
  private requiredEnvVars: EnvironmentConfig[] = [
    // Core Application
    { name: "NODE_ENV", required: true, description: "Environment mode", defaultValue: "production" },
    { name: "NEXT_PUBLIC_APP_ENV", required: true, description: "Public app environment", defaultValue: "production" },
    { name: "NEXT_PUBLIC_BUILD_VERSION", required: true, description: "Build version identifier" },

    // Supabase Configuration
    { name: "SUPABASE_URL", required: true, description: "Supabase project URL" },
    { name: "SUPABASE_ANON_KEY", required: true, description: "Supabase anonymous key" },
    { name: "SUPABASE_SERVICE_ROLE_KEY", required: true, description: "Supabase service role key" },
    { name: "NEXT_PUBLIC_SUPABASE_URL", required: true, description: "Public Supabase URL" },
    { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", required: true, description: "Public Supabase anonymous key" },

    // Database Configuration
    { name: "POSTGRES_URL", required: true, description: "PostgreSQL connection URL" },
    { name: "POSTGRES_PRISMA_URL", required: true, description: "Prisma PostgreSQL URL" },
    { name: "POSTGRES_URL_NON_POOLING", required: true, description: "Non-pooling PostgreSQL URL" },

    // File Storage
    { name: "BLOB_READ_WRITE_TOKEN", required: true, description: "Vercel Blob storage token" },

    // AI Services
    { name: "XAI_API_KEY", required: true, description: "xAI API key for Grok" },

    // Application Settings
    { name: "NEXT_PUBLIC_SITE_URL", required: true, description: "Production site URL" },
    { name: "NEXT_PUBLIC_APP_NAME", required: false, description: "Application name", defaultValue: "SofaCover Pro" },
    { name: "NEXT_PUBLIC_APP_VERSION", required: false, description: "Application version", defaultValue: "1.0.0" },

    // Email Configuration
    { name: "SMTP_HOST", required: false, description: "SMTP server host" },
    { name: "SMTP_PORT", required: false, description: "SMTP server port", defaultValue: "587" },
    { name: "SMTP_USER", required: false, description: "SMTP username" },
    { name: "SMTP_PASS", required: false, description: "SMTP password" },
    { name: "SMTP_FROM_EMAIL", required: false, description: "From email address" },

    // Security
    { name: "JWT_SECRET", required: true, description: "JWT signing secret" },
    { name: "ENCRYPTION_KEY", required: true, description: "Data encryption key" },
    { name: "CSRF_SECRET", required: true, description: "CSRF protection secret" },

    // Monitoring
    { name: "NEXT_PUBLIC_GA_MEASUREMENT_ID", required: false, description: "Google Analytics measurement ID" },
    { name: "SENTRY_DSN", required: false, description: "Sentry error tracking DSN" },

    // Feature Flags
    {
      name: "NEXT_PUBLIC_USE_SUPABASE",
      required: false,
      description: "Enable Supabase integration",
      defaultValue: "true",
    },
    { name: "NEXT_PUBLIC_DEMO_MODE", required: false, description: "Enable demo mode", defaultValue: "false" },
  ]

  async validateEnvironment(): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    console.log("🔍 Validating production environment variables...")

    for (const envVar of this.requiredEnvVars) {
      const value = process.env[envVar.name]

      if (!value) {
        if (envVar.required) {
          errors.push(`❌ Required environment variable ${envVar.name} is missing`)
        } else {
          warnings.push(`⚠️  Optional environment variable ${envVar.name} is not set`)
        }
      } else {
        // Validate value if validation function exists
        if (envVar.validation && !envVar.validation(value)) {
          errors.push(`❌ Environment variable ${envVar.name} has invalid value`)
        } else {
          console.log(`✅ ${envVar.name}: Set`)
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  async setupVercelEnvironment(): Promise<void> {
    console.log("🚀 Setting up Vercel production environment...")

    try {
      // Check if Vercel CLI is available
      await execAsync("vercel --version")
      console.log("✅ Vercel CLI is available")

      // Set production environment variables
      const envVarsToSet = this.requiredEnvVars
        .filter((env) => env.required && process.env[env.name])
        .map((env) => ({ name: env.name, value: process.env[env.name]! }))

      for (const { name, value } of envVarsToSet) {
        try {
          await execAsync(`vercel env add ${name} production`, { input: value })
          console.log(`✅ Set ${name} in Vercel production environment`)
        } catch (error) {
          console.log(`⚠️  ${name} may already exist in Vercel environment`)
        }
      }
    } catch (error) {
      console.log("⚠️  Vercel CLI not available. Please set environment variables manually in Vercel dashboard.")
    }
  }

  async generateEnvironmentDocumentation(): Promise<void> {
    console.log("📝 Generating environment documentation...")

    const documentation = `# Production Environment Variables

## Required Variables

${this.requiredEnvVars
  .filter((env) => env.required)
  .map(
    (env) => `### ${env.name}
- **Description**: ${env.description}
- **Required**: Yes
- **Default**: ${env.defaultValue || "None"}
`,
  )
  .join("\n")}

## Optional Variables

${this.requiredEnvVars
  .filter((env) => !env.required)
  .map(
    (env) => `### ${env.name}
- **Description**: ${env.description}
- **Required**: No
- **Default**: ${env.defaultValue || "None"}
`,
  )
  .join("\n")}

## Setup Instructions

1. Copy environment variables from your development environment
2. Update values for production (database URLs, API keys, etc.)
3. Set variables in Vercel dashboard or use Vercel CLI
4. Run validation script to ensure all required variables are set

## Validation

Run the following command to validate your environment:

\`\`\`bash
npm run validate:env
\`\`\`

---
Generated on: ${new Date().toISOString()}
`

    await fs.writeFile(path.join(process.cwd(), "docs", "PRODUCTION_ENVIRONMENT_VARIABLES.md"), documentation)
    console.log("✅ Environment documentation generated")
  }

  async setupProductionConfiguration(): Promise<void> {
    console.log("⚙️  Setting up production configuration...")

    // Validate environment
    const validation = await this.validateEnvironment()

    if (!validation.valid) {
      console.log("\n❌ Environment validation failed:")
      validation.errors.forEach((error) => console.log(error))
      throw new Error("Environment validation failed")
    }

    if (validation.warnings.length > 0) {
      console.log("\n⚠️  Environment warnings:")
      validation.warnings.forEach((warning) => console.log(warning))
    }

    // Setup Vercel environment
    await this.setupVercelEnvironment()

    // Generate documentation
    await this.generateEnvironmentDocumentation()

    console.log("\n✅ Production environment setup completed successfully!")
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new ProductionEnvironmentSetup()
  setup.setupProductionConfiguration().catch(console.error)
}

export default ProductionEnvironmentSetup
