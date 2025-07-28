# Deployment Guide

## Prerequisites

### Development Environment
- Node.js 18+ 
- npm or yarn
- Git

### Production Environment
- Vercel account (recommended) or similar hosting platform
- Domain name (optional)
- SSL certificate (handled by Vercel)

## Environment Variables

Create `.env.local` for development and configure production environment variables:

\`\`\`bash
# Database (when implementing real database)
DATABASE_URL=postgresql://username:password@localhost:5432/sofa_covers

# Authentication (future implementation)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Email Service (future implementation)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# External Services
QR_CODE_SERVICE_URL=https://api.qr-server.com
PAYMENT_GATEWAY_URL=https://api.payment-provider.com
PAYMENT_GATEWAY_KEY=your-payment-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id

# Feature Flags
ENABLE_REAL_PAYMENTS=false
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_ANALYTICS=true
\`\`\`

## Local Development

1. **Clone Repository**
\`\`\`bash
git clone <repository-url>
cd sofa-cover-business
\`\`\`

2. **Install Dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set Up Environment**
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your values
\`\`\`

4. **Run Development Server**
\`\`\`bash
npm run dev
\`\`\`

5. **Run Tests**
\`\`\`bash
npm test
npm run test:coverage
\`\`\`

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Environment Variables**
   - In project settings, add all production environment variables
   - Ensure sensitive keys are properly secured

3. **Deploy**
   - Vercel automatically deploys on git push to main branch
   - Monitor deployment logs for any issues

4. **Custom Domain (Optional)**
   - Add your domain in Vercel project settings
   - Configure DNS records as instructed

### Option 2: Docker Deployment

1. **Create Dockerfile**
\`\`\`dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
\`\`\`

2. **Build and Run**
\`\`\`bash
docker build -t sofa-cover-app .
docker run -p 3000:3000 sofa-cover-app
\`\`\`

### Option 3: Traditional Server

1. **Build Application**
\`\`\`bash
npm run build
\`\`\`

2. **Start Production Server**
\`\`\`bash
npm start
\`\`\`

3. **Process Manager (PM2)**
\`\`\`bash
npm install -g pm2
pm2 start npm --name "sofa-cover-app" -- start
pm2 startup
pm2 save
\`\`\`

## Database Setup (Future Implementation)

### PostgreSQL Setup
\`\`\`sql
-- Create database
CREATE DATABASE sofa_covers;

-- Create user
CREATE USER sofa_app WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE sofa_covers TO sofa_app;

-- Run migrations
npm run db:migrate
npm run db:seed
\`\`\`

### MongoDB Setup
\`\`\`bash
# Install MongoDB
# Create database and user
use sofa_covers
db.createUser({
  user: "sofa_app",
  pwd: "secure_password",
  roles: ["readWrite"]
})
\`\`\`

## Monitoring Setup

### Error Tracking (Sentry)
\`\`\`bash
npm install @sentry/nextjs
\`\`\`

Add to `next.config.js`:
\`\`\`javascript
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  {
    // Your Next.js config
  },
  {
    silent: true,
    org: "your-org",
    project: "sofa-cover-app",
  }
)
\`\`\`

### Performance Monitoring
\`\`\`bash
# Add to your monitoring service
npm install @vercel/analytics
\`\`\`

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] Error messages don't expose sensitive data
- [ ] Dependencies regularly updated
- [ ] Security scanning enabled

## Performance Optimization

### Build Optimization
\`\`\`bash
# Analyze bundle size
npm run analyze

# Optimize images
npm install next-optimized-images

# Enable compression
# (Handled automatically by Vercel)
\`\`\`

### CDN Configuration
- Static assets served from CDN
- Image optimization enabled
- Caching headers configured

## Backup Strategy

### Database Backups
\`\`\`bash
# PostgreSQL
pg_dump sofa_covers > backup_$(date +%Y%m%d).sql

# MongoDB
mongodump --db sofa_covers --out backup_$(date +%Y%m%d)
\`\`\`

### File Backups
- User uploads backed up to cloud storage
- Configuration files version controlled
- Regular automated backups scheduled

## Rollback Procedure

1. **Identify Issue**
   - Check monitoring dashboards
   - Review error logs
   - Confirm impact scope

2. **Quick Rollback**
   \`\`\`bash
   # Vercel
   vercel rollback [deployment-url]
   
   # Docker
   docker run previous-image-tag
   
   # PM2
   pm2 restart app --update-env
   \`\`\`

3. **Database Rollback** (if needed)
   \`\`\`bash
   # Restore from backup
   psql sofa_covers < backup_20240115.sql
   \`\`\`

4. **Verify Recovery**
   - Test critical functionality
   - Monitor error rates
   - Confirm user access

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Review security alerts weekly
- [ ] Monitor performance metrics daily
- [ ] Backup verification weekly
- [ ] Log rotation and cleanup

### Health Checks
\`\`\`bash
# API health check
curl https://your-domain.com/api/health

# Database connection
npm run db:check

# External services
npm run services:check
\`\`\`

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Review build logs for specific errors

2. **Runtime Errors**
   - Check environment variables
   - Verify database connectivity
   - Review application logs

3. **Performance Issues**
   - Monitor Core Web Vitals
   - Check database query performance
   - Review bundle size and loading times

### Support Contacts
- **Development Team**: dev-team@company.com
- **DevOps**: devops@company.com
- **Emergency**: +1-555-SUPPORT
