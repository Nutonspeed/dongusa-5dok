# 🔧 Troubleshooting Guide - SofaCover Pro

คู่มือแก้ไขปัญหาสำหรับปัญหาที่พบบ่อยในระบบ SofaCover Pro

## 🚨 Emergency Contacts

### Critical Issues (24/7)
- **On-call Engineer**: +66-xxx-xxx-xxxx
- **Tech Lead**: +66-xxx-xxx-xxxx
- **DevOps**: +66-xxx-xxx-xxxx

### Business Hours Support
- **Development Team**: #sofacover-dev
- **Support Team**: support@sofacoverpro.com
- **Project Manager**: pm@sofacoverpro.com

## 🔍 Quick Diagnosis

### System Health Check
\`\`\`bash
# Check overall system health
curl https://sofacoverpro.com/api/health

# Check database connectivity
curl https://sofacoverpro.com/api/health/database

# Check cache status
curl https://sofacoverpro.com/api/health/cache
\`\`\`

### Common Status Codes
- **200**: System healthy
- **503**: Service unavailable
- **500**: Internal server error
- **429**: Rate limit exceeded

## 🐛 Common Issues & Solutions

### 1. Website Down / Not Loading

#### Symptoms
- Website returns 503 error
- Extremely slow loading times
- Timeout errors

#### Quick Checks
\`\`\`bash
# Check if site is accessible
curl -I https://sofacoverpro.com

# Check DNS resolution
nslookup sofacoverpro.com

# Check SSL certificate
openssl s_client -connect sofacoverpro.com:443
\`\`\`

#### Solutions
1. **Check Vercel Status**
   - Visit [Vercel Status Page](https://vercel-status.com)
   - Check for ongoing incidents

2. **Check Application Logs**
   \`\`\`bash
   # View recent logs
   vercel logs --app=sofacover-pro --since=1h
   \`\`\`

3. **Restart Application**
   \`\`\`bash
   # Trigger new deployment
   vercel --prod
   \`\`\`

4. **Rollback if Needed**
   \`\`\`bash
   # Rollback to previous version
   vercel rollback [deployment-url] --prod
   \`\`\`

### 2. Database Connection Issues

#### Symptoms
- "Database connection failed" errors
- Slow query responses
- Connection timeout errors

#### Quick Checks
\`\`\`sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
\`\`\`

#### Solutions
1. **Check Supabase Status**
   - Visit [Supabase Status](https://status.supabase.com)
   - Check project dashboard

2. **Restart Connection Pool**
   \`\`\`typescript
   // In your application
   await supabase.auth.signOut() // Clear connections
   // Restart application
   \`\`\`

3. **Kill Long-Running Queries**
   \`\`\`sql
   -- Kill specific query
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
   WHERE pid = [process_id];
   \`\`\`

4. **Scale Database if Needed**
   - Upgrade Supabase plan temporarily
   - Add read replicas if available

### 3. Authentication Problems

#### Symptoms
- Users can't log in
- Session expires immediately
- "Invalid token" errors

#### Quick Checks
\`\`\`typescript
// Check auth configuration
const { data: { session } } = await supabase.auth.getSession()
console.log('Current session:', session)

// Verify JWT token
const jwt = require('jsonwebtoken')
const decoded = jwt.decode(token, { complete: true })
console.log('Token payload:', decoded)
\`\`\`

#### Solutions
1. **Check Environment Variables**
   \`\`\`bash
   # Verify auth variables are set
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   echo $SUPABASE_SERVICE_ROLE_KEY
   \`\`\`

2. **Clear Auth Cache**
   \`\`\`typescript
   // Clear all auth data
   await supabase.auth.signOut()
   localStorage.clear()
   sessionStorage.clear()
   \`\`\`

3. **Check Supabase Auth Settings**
   - Verify redirect URLs
   - Check rate limiting settings
   - Verify email templates

4. **Reset User Sessions**
   \`\`\`sql
   -- Force logout all users (emergency only)
   UPDATE auth.users SET updated_at = now();
   \`\`\`

### 4. Payment Processing Issues

#### Symptoms
- Payment failures
- PromptPay QR codes not generating
- Order status not updating

#### Quick Checks
\`\`\`typescript
// Test payment service
const paymentTest = await fetch('/api/payments/test')
console.log('Payment service status:', paymentTest.status)

// Check PromptPay generation
const qrTest = await fetch('/api/payments/promptpay/generate', {
  method: 'POST',
  body: JSON.stringify({ amount: 100, order_id: 'test' })
})
\`\`\`

#### Solutions
1. **Check Payment Gateway Status**
   - Verify third-party service status
   - Check API credentials

2. **Verify Environment Variables**
   \`\`\`bash
   echo $PROMPTPAY_ID
   echo $BANK_ACCOUNT_NUMBER
   \`\`\`

3. **Test Payment Flow**
   \`\`\`typescript
   // Create test payment
   const testPayment = await createPayment({
     amount: 1,
     currency: 'THB',
     method: 'test'
   })
   \`\`\`

4. **Check Order Processing**
   \`\`\`sql
   -- Check stuck orders
   SELECT * FROM orders 
   WHERE status = 'pending' 
   AND created_at < now() - interval '1 hour';
   \`\`\`

### 5. Performance Issues

#### Symptoms
- Slow page loading
- High response times
- Timeout errors

#### Quick Checks
\`\`\`bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://sofacoverpro.com

# Monitor resource usage
top -p $(pgrep node)

# Check cache hit rates
redis-cli info stats
\`\`\`

#### Solutions
1. **Check Cache Status**
   \`\`\`typescript
   // Verify cache is working
   const cacheTest = await redis.ping()
   console.log('Cache status:', cacheTest)
   \`\`\`

2. **Clear Cache if Needed**
   \`\`\`bash
   # Clear Redis cache
   redis-cli FLUSHALL
   
   # Clear CDN cache
   curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache"
   \`\`\`

3. **Optimize Database Queries**
   \`\`\`sql
   -- Find slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   \`\`\`

4. **Scale Resources**
   - Increase Vercel function memory
   - Upgrade database plan
   - Add more cache instances

### 6. Email Delivery Issues

#### Symptoms
- Emails not being sent
- Emails going to spam
- SMTP errors

#### Quick Checks
\`\`\`typescript
// Test email service
const emailTest = await fetch('/api/test-email', {
  method: 'POST',
  body: JSON.stringify({ to: 'test@example.com' })
})
\`\`\`

#### Solutions
1. **Check SMTP Configuration**
   \`\`\`bash
   echo $SMTP_HOST
   echo $SMTP_PORT
   echo $SMTP_USER
   \`\`\`

2. **Test SMTP Connection**
   \`\`\`bash
   telnet $SMTP_HOST $SMTP_PORT
   \`\`\`

3. **Check Email Queue**
   \`\`\`sql
   -- Check pending emails
   SELECT * FROM email_queue 
   WHERE status = 'pending' 
   ORDER BY created_at DESC;
   \`\`\`

4. **Verify DNS Records**
   \`\`\`bash
   # Check SPF record
   dig TXT sofacoverpro.com | grep spf
   
   # Check DKIM record
   dig TXT default._domainkey.sofacoverpro.com
   \`\`\`

## 📊 Monitoring & Alerts

### Key Metrics to Watch
- **Response Time**: < 2 seconds
- **Error Rate**: < 1%
- **Database Connections**: < 80% of limit
- **Memory Usage**: < 85%
- **CPU Usage**: < 80%

### Alert Thresholds
\`\`\`typescript
const alertThresholds = {
  response_time: 5000, // 5 seconds
  error_rate: 5, // 5%
  cpu_usage: 90, // 90%
  memory_usage: 95, // 95%
  disk_usage: 90, // 90%
  db_connections: 90 // 90% of limit
}
\`\`\`

### Monitoring Commands
\`\`\`bash
# Check system metrics
curl https://sofacoverpro.com/api/monitoring/metrics

# Check recent alerts
curl https://sofacoverpro.com/api/monitoring/alerts

# Check system health
curl https://sofacoverpro.com/api/health
\`\`\`

## 🚨 Incident Response

### Severity Levels

#### P0 - Critical (Response: Immediate)
- Complete site outage
- Data loss or corruption
- Security breach
- Payment system down

#### P1 - High (Response: < 1 hour)
- Major feature not working
- Performance severely degraded
- Authentication issues
- Database connectivity issues

#### P2 - Medium (Response: < 4 hours)
- Minor feature issues
- Moderate performance issues
- Non-critical API errors

#### P3 - Low (Response: < 24 hours)
- Cosmetic issues
- Documentation updates
- Enhancement requests

### Incident Response Steps

1. **Acknowledge** the incident immediately
2. **Assess** the severity and impact
3. **Communicate** with stakeholders
4. **Investigate** the root cause
5. **Implement** a fix or workaround
6. **Monitor** the resolution
7. **Document** the incident and lessons learned

### Communication Templates

#### Initial Alert
\`\`\`
🚨 INCIDENT ALERT - P[X]
Issue: [Brief description]
Impact: [Who/what is affected]
Status: Investigating
ETA: [Estimated resolution time]
Updates: Will provide updates every 30 minutes
\`\`\`

#### Resolution Notice
\`\`\`
✅ INCIDENT RESOLVED - P[X]
Issue: [Brief description]
Resolution: [What was done to fix it]
Duration: [How long the incident lasted]
Next Steps: [Any follow-up actions]
\`\`\`

## 🔧 Maintenance Procedures

### Scheduled Maintenance
- **Database maintenance**: Weekly, Sundays 2:00 AM - 4:00 AM
- **Security updates**: Monthly, first Sunday of month
- **Performance optimization**: Quarterly
- **Backup verification**: Weekly

### Emergency Maintenance
1. **Notify stakeholders** immediately
2. **Put site in maintenance mode** if needed
3. **Perform necessary fixes**
4. **Test thoroughly** before going live
5. **Monitor closely** after maintenance

### Maintenance Mode
\`\`\`typescript
// Enable maintenance mode
await redis.set('maintenance_mode', 'true', 'EX', 3600) // 1 hour

// Disable maintenance mode
await redis.del('maintenance_mode')
\`\`\`

## 📞 Escalation Matrix

### Level 1: Self-Service
- Check this troubleshooting guide
- Review monitoring dashboards
- Check status pages

### Level 2: Team Support
- Post in #sofacover-dev Slack channel
- Create GitHub issue
- Contact team members

### Level 3: Senior Support
- Contact Tech Lead
- Escalate to DevOps team
- Involve Project Manager

### Level 4: Executive
- Contact CTO
- Involve CEO for business-critical issues
- External vendor escalation

## 📚 Additional Resources

### Documentation
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

### External Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Troubleshooting](https://supabase.com/docs/guides/troubleshooting)
- [Next.js Debugging](https://nextjs.org/docs/advanced-features/debugging)

### Tools
- **Monitoring**: https://monitoring.sofacoverpro.com
- **Logs**: https://logs.sofacoverpro.com
- **Status Page**: https://status.sofacoverpro.com

---

**Remember**: When in doubt, don't hesitate to ask for help. It's better to escalate early than to let an issue become worse.

*เอกสารอัปเดตล่าสุด: 15 มกราคม 2025*
