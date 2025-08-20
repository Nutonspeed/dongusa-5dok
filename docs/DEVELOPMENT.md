# Development Guide

## Quick Start

1. **Setup Environment**
   ```bash
   npm run dev:setup
   ```

2. **Validate Configuration**
   ```bash
   npm run dev:validate
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run dev:mock` - Start with mock services
- `npm run dev:supabase` - Start with Supabase
- `npm run dev:validate` - Validate environment
- `npm run build:production` - Build for production

## Environment Configuration

Copy `.env.example` to `.env.local` and update the values:

### Required for Development
- `NODE_ENV=development`
- `NEXTAUTH_SECRET` - Any 32+ character string
- `NEXT_PUBLIC_SITE_URL` - Usually http://localhost:3000

### Optional for Development
- `QA_BYPASS_AUTH=1` - Skip authentication
- `ENABLE_MOCK_SERVICES=true` - Use mock services

## Database

### Mock Database (Default)
- No setup required
- Uses local JSON files
- Perfect for development

### Supabase Database
1. Create Supabase project
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Run database setup: `npm run db:setup`

## Troubleshooting

### Common Issues

1. **Environment Variables**
   - Run `npm run test:env` to check configuration
   - Copy `.env.example` to `.env.local`

2. **Database Connection**
   - Check Supabase credentials

3. **Build Errors**
   - Run `npm run clean` and try again
   - Check TypeScript errors with `npm run type-check`

### Getting Help

1. Check the logs in the console
2. Run validation: `npm run dev:validate`
3. Check environment: `npm run test:env`
