#!/bin/bash

# Phase 2 Implementation Setup Script
# This script automates the initial setup for Phase 2 development environment

set -e  # Exit on any error

echo "🚀 Starting Phase 2 Implementation Setup..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "=== Checking Prerequisites ==="

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    # Check Node.js version
    node_version=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    print_status "Node.js version: $(node --version) ✓"

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    print_status "npm version: $(npm --version) ✓"

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some development features may not work."
    else
        print_status "Docker version: $(docker --version) ✓"
    fi

    # Check if Git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed."
        exit 1
    fi
    print_status "Git version: $(git --version) ✓"
}

# Setup development environment
setup_dev_environment() {
    print_header "=== Setting Up Development Environment ==="

    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install

    # Setup Husky git hooks
    print_status "Setting up Git hooks..."
    npx husky install

    # Setup environment variables
    print_status "Setting up environment variables..."
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local 2>/dev/null || {
            print_warning ".env.example not found. Creating basic .env.local"
            cat > .env.local << EOL
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
EOL
        print_warning "Please update .env.local with your actual environment variables"
    else
        print_status "Environment file already exists ✓"
    fi
}

# Setup database
setup_database() {
    print_header "=== Setting Up Database ==="

    # Run database migrations
    if [ -f "scripts/setup-database.ts" ]; then
        print_status "Running database setup..."
        npm run db:setup
    else
        print_warning "Database setup script not found. Please run manually."
    fi

    # Seed development data
    if [ -f "scripts/db-seed.ts" ]; then
        print_status "Seeding development data..."
        npm run db:seed
    else
        print_warning "Database seed script not found."
    fi
}

# Setup Docker development environment
setup_docker() {
    print_header "=== Setting Up Docker Environment ==="

    if command -v docker &> /dev/null; then
        # Create docker-compose.dev.yml if it doesn't exist
        if [ ! -f "docker-compose.dev.yml" ]; then
            print_status "Creating docker-compose.dev.yml..."
            cat > docker-compose.dev.yml << EOL
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
EOL
        fi

        print_status "Starting Docker containers..."
        docker-compose -f docker-compose.dev.yml up -d

        # Wait for services to be ready
        print_status "Waiting for services to be ready..."
        sleep 10

        # Check if PostgreSQL is ready
        for i in {1..30}; do
            if docker exec phase2-postgres pg_isready -U postgres > /dev/null 2>&1; then
                print_status "PostgreSQL is ready ✓"
                break
            fi
            if [ $i -eq 30 ]; then
                print_error "PostgreSQL failed to start"
                exit 1
            fi
            sleep 2
        done

        # Check if Redis is ready
        if docker exec phase2-redis redis-cli ping > /dev/null 2>&1; then
            print_status "Redis is ready ✓"
        else
            print_warning "Redis may not be ready"
        fi

    else
        print_warning "Docker not available. Skipping containerized services setup."
    fi
}

# Setup development tools
setup_dev_tools() {
    print_header "=== Setting Up Development Tools ==="

    # Setup VSCode settings if VSCode is being used
    if [ -d ".vscode" ] || command -v code &> /dev/null; then
        print_status "Setting up VSCode configuration..."
        mkdir -p .vscode

        # Create VSCode settings
        cat > .vscode/settings.json << EOL
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
  }
}
EOL

        # Create VSCode extensions recommendations
        cat > .vscode/extensions.json << EOL
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
    "github.copilot"
  ]
}
EOL

        print_status "VSCode configuration created ✓"
    fi

    # Setup Git configuration
    print_status "Setting up Git configuration..."
    git config --local core.autocrlf false
    git config --local pull.rebase true

    # Setup pre-commit hooks
    if [ -f ".husky/pre-commit" ]; then
        print_status "Git hooks configured ✓"
    fi
}

# Setup monitoring and analytics
setup_monitoring() {
    print_header "=== Setting Up Monitoring and Analytics ==="

    # Create monitoring configuration directory
    mkdir -p config/monitoring

    # Create basic monitoring configuration
    print_status "Creating monitoring configuration..."
    cat > config/monitoring/development.json << EOL
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
EOL

    print_status "Monitoring configuration created ✓"
}

# Run health checks
run_health_checks() {
    print_header "=== Running Health Checks ==="

    # Check if the application can start
    print_status "Testing application startup..."
    if npm run build > /dev/null 2>&1; then
        print_status "Application build successful ✓"
    else
        print_error "Application build failed. Please check the configuration."
        return 1
    fi

    # Run tests if available
    if [ -f "jest.config.js" ] || grep -q '"test"' package.json; then
        print_status "Running test suite..."
        if npm test > /dev/null 2>&1; then
            print_status "Tests passed ✓"
        else
            print_warning "Some tests failed. Please review test results."
        fi
    fi

    # Check TypeScript compilation
    if npm run typecheck > /dev/null 2>&1; then
        print_status "TypeScript compilation successful ✓"
    else
        print_warning "TypeScript errors found. Please review and fix."
    fi
}

# Print completion message and next steps
print_completion() {
    print_header "=== Setup Complete! ==="

    echo ""
    print_status "🎉 Phase 2 development environment setup complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Review and update .env.local with your actual environment variables"
    echo "  2. Start the development server: npm run dev"
    echo "  3. Open http://localhost:3000 in your browser"
    echo "  4. Review the Phase 2 implementation checklist in docs/implementation-checklist.md"
    echo ""
    echo "🔧 Available commands:"
    echo "  npm run dev          - Start development server"
    echo "  npm run build        - Build for production"
    echo "  npm run test         - Run test suite"
    echo "  npm run lint         - Run linting"
    echo "  npm run typecheck    - Check TypeScript"
    echo ""
    echo "🐳 Docker services (if running):"
    echo "  PostgreSQL: localhost:5432"
    echo "  Redis: localhost:6379"
    echo "  Elasticsearch: localhost:9200"
    echo "  MailHog UI: http://localhost:8025"
    echo ""
    echo "📖 Documentation:"
    echo "  Implementation Guide: docs/phase2-implementation-strategy.md"
    echo "  System Architecture: docs/system-architecture-design.md"
    echo "  Testing Strategy: docs/testing-deployment-strategy.md"
    echo ""
    print_status "Happy coding! 🚀"
}

# Main execution flow
main() {
    check_prerequisites
    setup_dev_environment
    setup_database
    setup_docker
    setup_dev_tools
    setup_monitoring
    run_health_checks
    print_completion
}

# Handle script interruption
trap 'print_error "Setup interrupted. Please run the script again to complete setup."; exit 1' INT TERM

# Check if script is run from project root
if [ ! -f "package.json" ]; then
    print_error "This script must be run from the project root directory (where package.json is located)."
    exit 1
fi

# Run main function
main "$@"
