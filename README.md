# ร้านจริง - Thai E-commerce Management System

A comprehensive e-commerce and business management platform built with Next.js, designed specifically for Thai businesses.

## Features

### 🛍️ E-commerce Core
- Product catalog management
- Shopping cart and checkout
- Order processing and tracking
- Customer account management
- Inventory management with low stock alerts

### 💳 Payment Integration
- Stripe payment processing
- PromptPay integration for Thai market
- Bank transfer support
- Payment verification and webhooks

### 📊 Business Management
- Admin dashboard with analytics
- Order management system
- Customer relationship management
- Inventory tracking and reporting
- Bulk operations for efficiency

### 🔧 Technical Features
- Built with Next.js 14 and TypeScript
- Supabase for database and authentication
- Redis caching with Upstash
- **Automated Code Review** with ESLint, TypeScript, and SonarCloud
- **CI/CD Pipeline** with GitHub Actions
- **Team Notifications** via Slack, Discord, and Teams
- **Security Scanning** with CodeQL and npm audit
- **Quality Gates** for deployment protection
- File storage with Vercel Blob
- AI-powered features with xAI integration
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Payments**: Stripe + PromptPay
- **Caching**: Upstash Redis
- **Storage**: Vercel Blob
- **AI**: xAI (Grok)
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd ร้านจริง
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your environment variables in `.env.local`:
- Database: Supabase connection strings
- Authentication: Supabase keys
- Payments: Stripe and PromptPay credentials
- Storage: Vercel Blob token
- AI: xAI API key

5. Run database setup:
\`\`\`bash
pnpm run db:setup
\`\`\`

6. Start the development server:
\`\`\`bash
pnpm dev
\`\`\`

## Development Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `npm run code-quality` - Run comprehensive code quality analysis
- `npm run code-review` - Generate code review report with notifications
- `npm run notify-team` - Send team notifications
- `npm run notify-test` - Test notification system

## 🔍 Automated Code Review System

This project includes a comprehensive automated code review system that ensures code quality and security:

### Features
- **Static Analysis**: ESLint, TypeScript checking, and SonarCloud integration
- **Security Scanning**: npm audit and GitHub CodeQL analysis  
- **Team Notifications**: Automatic alerts via Slack, Discord, and Teams
- **Quality Gates**: Deployment protection based on code quality metrics
- **PR Comments**: Automated code review summaries on pull requests

### Quick Setup
1. Add `SONAR_TOKEN` to GitHub repository secrets
2. Configure team webhooks (optional): `DEV_TEAM_WEBHOOK`, `QA_TEAM_WEBHOOK`
3. Customize notification settings in `.github/notifications.json`

### Documentation
- [`docs/AUTOMATED_CODE_REVIEW.md`](docs/AUTOMATED_CODE_REVIEW.md) - Complete system overview
- [`docs/TEAM_SETUP_GUIDE.md`](docs/TEAM_SETUP_GUIDE.md) - Team configuration guide

### Workflow Triggers
- **Pull Requests**: Automatic analysis on PRs to `main` or `develop`
- **Push Events**: Quality checks on pushes to protected branches
- **Manual**: Run `npm run code-quality` locally anytime
- `pnpm db:setup` - Initialize database
- `pnpm validate:system` - Run system validation

## QA Testing

Run the app in bypass/mock mode for testing:

\`\`\`bash
QA_BYPASS_AUTH=1 pnpm build
QA_BYPASS_AUTH=1 pnpm start
pnpm qa:smoke --verbose
\`\`\`

## โครงสร้างโปรเจค

```
.
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (marketing)/       # หน้าเว็บหลัก
│   └── (dashboard)/       # หน้าจัดการ (ถ้ามี)
├── components/            # Components ที่ใช้ร่วมกัน
│   ├── ui/               # UI Components พื้นฐาน
│   └── fabric/           # Components เกี่ยวกับผ้า
├── lib/                   # Utilities และ Helpers
│   ├── supabase/         # Supabase Client
│   └── utils/            # Utility functions
├── public/               # Static files
│   └── fabrics/          # รูปภาพผ้า
└── styles/               # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and validation
5. Submit a pull request

## License

This project is proprietary software for ร้านจริง business operations.
