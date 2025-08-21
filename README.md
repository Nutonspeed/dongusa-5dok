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
