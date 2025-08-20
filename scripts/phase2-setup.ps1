# Phase 2 Implementation Setup Script (PowerShell)
# This script automates the initial setup for Phase 2 development environment on Windows

param(
    [switch]$SkipDocker,
    [switch]$Verbose
)

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Color functions for output
function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Header {
    param($Message)
    Write-Host "`n$Message" -ForegroundColor Blue
    Write-Host ("=" * $Message.Length) -ForegroundColor Blue
}

function Test-Command {
    param($Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Check prerequisites
function Test-Prerequisites {
    Write-Header "Checking Prerequisites"

    # Check Node.js
    if (-not (Test-Command "node")) {
        Write-Error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    }

    # Check Node.js version
    $nodeVersion = (node --version) -replace "v", ""
    $majorVersion = [int]($nodeVersion.Split(".")[0])
    if ($majorVersion -lt 18) {
        Write-Error "Node.js version 18 or higher is required. Current version: v$nodeVersion"
        exit 1
    }
    Write-Info "Node.js version: v$nodeVersion ✓"

    # Check npm
    if (-not (Test-Command "npm")) {
        Write-Error "npm is not installed."
        exit 1
    }
    $npmVersion = npm --version
    Write-Info "npm version: $npmVersion ✓"

    # Check Git
    if (-not (Test-Command "git")) {
        Write-Error "Git is not installed."
        exit 1
    }
    $gitVersion = git --version
    Write-Info "$gitVersion ✓"

    # Check Docker (optional)
    if (-not $SkipDocker) {
        if (-not (Test-Command "docker")) {
            Write-Warning "Docker is not installed. Some development features may not work."
            Write-Warning "Use -SkipDocker flag to skip Docker setup."
        }
        else {
            $dockerVersion = docker --version
            Write-Info "$dockerVersion ✓"
        }
    }

    # Check PowerShell version
    $psVersion = $PSVersionTable.PSVersion
    if ($psVersion.Major -lt 5) {
        Write-Warning "PowerShell 5.0+ is recommended for better experience."
    }
    Write-Info "PowerShell version: $($psVersion.Major).$($psVersion.Minor) ✓"
}

# Setup development environment
function Initialize-DevEnvironment {
    Write-Header "Setting Up Development Environment"

    # Install Node.js dependencies
    Write-Info "Installing Node.js dependencies..."
    try {
        npm install
        Write-Info "Dependencies installed successfully ✓"
    }
    catch {
        Write-Error "Failed to install dependencies: $_"
        exit 1
    }

    # Setup Husky git hooks
    if (Test-Path ".husky") {
        Write-Info "Setting up Git hooks..."
        try {
            npx husky install
            Write-Info "Git hooks configured ✓"
        }
        catch {
            Write-Warning "Failed to setup Git hooks: $_"
        }
    }

    # Setup environment variables
    Write-Info "Setting up environment variables..."
    if (-not (Test-Path ".env.local")) {
        $envContent = @"
# Phase 2 Development Environment Variables
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Database
DATABASE_URL=your_database_url_here
DIRECT_URL=your_direct_database_url_here

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# External APIs
STRIPE_SECRET_KEY=your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Email
SMTP_HOST=your_smtp_host_here
SMTP_PORT=587
SMTP_USER=your_smtp_user_here
SMTP_PASS=your_smtp_password_here

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_measurement_id_here

# Feature Flags
NEXT_PUBLIC_ENABLE_MOBILE_APP_FEATURES=true
NEXT_PUBLIC_ENABLE_REAL_TIME_FEATURES=true
NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS=true
"@
        $envContent | Out-File -FilePath ".env.local" -Encoding utf8
        Write-Warning "Created .env.local - Please update with your actual environment variables"
    }
    else {
        Write-Info "Environment file already exists ✓"
    }
}

# Setup database
function Initialize-Database {
    Write-Header "Setting Up Database"

    # Check if database setup script exists
    if (Test-Path "scripts/setup-database.ts") {
        Write-Info "Running database setup..."
        try {
            npm run db:setup
            Write-Info "Database setup completed ✓"
        }
        catch {
            Write-Warning "Database setup failed: $_"
        }
    }
    else {
        Write-Warning "Database setup script not found. Please run manually."
    }

    # Seed development data
    if (Test-Path "scripts/db-seed.ts") {
        Write-Info "Seeding development data..."
        try {
            npm run db:seed
            Write-Info "Database seeding completed ✓"
        }
        catch {
            Write-Warning "Database seeding failed: $_"
        }
    }
    else {
        Write-Warning "Database seed script not found."
    }
}

# Setup Docker development environment
function Initialize-Docker {
    Write-Header "Setting Up Docker Environment"

    if ($SkipDocker) {
        Write-Info "Skipping Docker setup as requested."
        return
    }

    if (-not (Test-Command "docker")) {
        Write-Warning "Docker not available. Skipping containerized services setup."
        return
    }

    # Create docker-compose.dev.yml if it doesn't exist
    if (-not (Test-Path "docker-compose.dev.yml")) {
        Write-Info "Creating docker-compose.dev.yml..."
        $dockerComposeContent = @"
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: phase2-postgres
    environment:
      POSTGRES_DB: sofa_cover_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - phase2-network

  redis:
    image: redis:7-alpine
    container_name: phase2-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - phase2-network
    command: redis-server --appendonly yes

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: phase2-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    networks:
      - phase2-network

  mailhog:
    image: mailhog/mailhog
    container_name: phase2-mailhog
    ports:
      - "1025:1025"  # SMTP server
      - "8025:8025"  # Web UI
    networks:
      - phase2-network

volumes:
  postgres_data:
  redis_data:
  es_data:

networks:
  phase2-network:
    driver: bridge
"@
        $dockerComposeContent | Out-File -FilePath "docker-compose.dev.yml" -Encoding utf8
    }

    Write-Info "Starting Docker containers..."
    try {
        docker-compose -f docker-compose.dev.yml up -d

        Write-Info "Waiting for services to be ready..."
        Start-Sleep -Seconds 10

        # Check PostgreSQL
        $postgresReady = $false
        for ($i = 1; $i -le 30; $i++) {
            try {
                docker exec phase2-postgres pg_isready -U postgres 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Info "PostgreSQL is ready ✓"
                    $postgresReady = $true
                    break
                }
            }
            catch {}
            Start-Sleep -Seconds 2
        }

        if (-not $postgresReady) {
            Write-Warning "PostgreSQL may not be ready"
        }

        # Check Redis
        try {
            docker exec phase2-redis redis-cli ping 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Info "Redis is ready ✓"
            }
        }
        catch {
            Write-Warning "Redis may not be ready"
        }
    }
    catch {
        Write-Warning "Docker setup failed: $_"
    }
}

# Setup development tools
function Initialize-DevTools {
    Write-Header "Setting Up Development Tools"

    # Setup VSCode configuration
    Write-Info "Setting up VSCode configuration..."
    New-Item -ItemType Directory -Force -Path ".vscode" | Out-Null

    # VSCode settings
    $vscodeSettings = @"
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/.git": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "HTML"
  },
  "files.eol": "\n"
}
"@
    $vscodeSettings | Out-File -FilePath ".vscode/settings.json" -Encoding utf8

    # VSCode extensions
    $vscodeExtensions = @"
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-kubernetes-tools.vscode-kubernetes-tools",
    "ms-vscode-remote.remote-containers",
    "github.copilot",
    "ms-vscode.powershell"
  ]
}
"@
    $vscodeExtensions | Out-File -FilePath ".vscode/extensions.json" -Encoding utf8
    Write-Info "VSCode configuration created ✓"

    # Setup Git configuration
    Write-Info "Setting up Git configuration..."
    try {
        git config --local core.autocrlf false
        git config --local pull.rebase true
        git config --local core.eol lf
        Write-Info "Git configuration updated ✓"
    }
    catch {
        Write-Warning "Git configuration failed: $_"
    }
}

# Setup monitoring and analytics
function Initialize-Monitoring {
    Write-Header "Setting Up Monitoring and Analytics"

    # Create monitoring configuration directory
    New-Item -ItemType Directory -Force -Path "config/monitoring" | Out-Null

    # Create monitoring configuration
    Write-Info "Creating monitoring configuration..."
    $monitoringConfig = @"
{
  "environment": "development",
  "monitoring": {
    "enabled": true,
    "logLevel": "debug",
    "metrics": {
      "enabled": true,
      "interval": 30000
    },
    "healthChecks": {
      "enabled": true,
      "endpoint": "/api/health"
    }
  },
  "analytics": {
    "enabled": false,
    "provider": "development",
    "trackingId": "dev-only"
  },
  "errorReporting": {
    "enabled": true,
    "provider": "console"
  }
}
"@
    $monitoringConfig | Out-File -FilePath "config/monitoring/development.json" -Encoding utf8
    Write-Info "Monitoring configuration created ✓"
}

# Run health checks
function Test-HealthChecks {
    Write-Header "Running Health Checks"

    # Test application build
    Write-Info "Testing application build..."
    try {
        npm run build 2>$null | Out-Null
        Write-Info "Application build successful ✓"
    }
    catch {
        Write-Warning "Application build failed. Please check the configuration."
        return $false
    }

    # Run tests if available
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts.test) {
        Write-Info "Running test suite..."
        try {
            npm test 2>$null | Out-Null
            Write-Info "Tests passed ✓"
        }
        catch {
            Write-Warning "Some tests failed. Please review test results."
        }
    }

    # Check TypeScript compilation
    if ($packageJson.scripts.typecheck) {
        Write-Info "Checking TypeScript compilation..."
        try {
            npm run typecheck 2>$null | Out-Null
            Write-Info "TypeScript compilation successful ✓"
        }
        catch {
            Write-Warning "TypeScript errors found. Please review and fix."
        }
    }

    return $true
}

# Show completion message
function Show-CompletionMessage {
    Write-Header "Setup Complete!"

    Write-Host ""
    Write-Info "🎉 Phase 2 development environment setup complete!"
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Review and update .env.local with your actual environment variables"
    Write-Host "  2. Start the development server: npm run dev"
    Write-Host "  3. Open http://localhost:3000 in your browser"
    Write-Host "  4. Review the Phase 2 implementation checklist in docs/implementation-checklist.md"
    Write-Host ""
    Write-Host "🔧 Available commands:" -ForegroundColor Cyan
    Write-Host "  npm run dev          - Start development server"
    Write-Host "  npm run build        - Build for production"
    Write-Host "  npm run test         - Run test suite"
    Write-Host "  npm run lint         - Run linting"
    Write-Host "  npm run typecheck    - Check TypeScript"
    Write-Host ""

    if (-not $SkipDocker -and (Test-Command "docker")) {
        Write-Host "🐳 Docker services:" -ForegroundColor Cyan
        Write-Host "  PostgreSQL: localhost:5432"
        Write-Host "  Redis: localhost:6379"
        Write-Host "  Elasticsearch: localhost:9200"
        Write-Host "  MailHog UI: http://localhost:8025"
        Write-Host ""
    }

    Write-Host "📖 Documentation:" -ForegroundColor Cyan
    Write-Host "  Implementation Guide: docs/phase2-implementation-strategy.md"
    Write-Host "  System Architecture: docs/system-architecture-design.md"
    Write-Host "  Testing Strategy: docs/testing-deployment-strategy.md"
    Write-Host ""
    Write-Info "Happy coding! 🚀"
}

# Main execution function
function Start-Setup {
    try {
        # Check if running from project root
        if (-not (Test-Path "package.json")) {
            Write-Error "This script must be run from the project root directory (where package.json is located)."
            exit 1
        }

        Write-Host "🚀 Starting Phase 2 Implementation Setup..." -ForegroundColor Magenta
        Write-Host ""

        Test-Prerequisites
        Initialize-DevEnvironment
        Initialize-Database
        Initialize-Docker
        Initialize-DevTools
        Initialize-Monitoring

        if (Test-HealthChecks) {
            Show-CompletionMessage
        }
        else {
            Write-Warning "Setup completed with warnings. Please review the output above."
        }
    }
    catch {
        Write-Error "Setup failed: $_"
        Write-Host "Please review the error above and try again." -ForegroundColor Red
        exit 1
    }
}

# Handle Ctrl+C gracefully
$null = Register-EngineEvent PowerShell.Exiting -Action {
    Write-Warning "Setup interrupted. Please run the script again to complete setup."
}

# Run the setup
Start-Setup
