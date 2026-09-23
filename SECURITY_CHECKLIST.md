# TechAstra Security Checklist

Quick reference for security best practices and pre-deployment checks.

---

## 🔴 CRITICAL - Must Do Before Production

- [ ] **Generate strong JWT_SECRET**
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  Update production `.env` with generated value

- [ ] **Verify HTTPS is enabled** on hosting platform (Render/Vercel)
  - Check platform settings
  - Test with `https://` URL
  - Verify redirect from `http://` to `https://`

- [ ] **Verify Neon database security:**
  - [ ] SSL/TLS connection required
  - [ ] IP restrictions enabled (if available)
  - [ ] Connection pooler configured
  - [ ] Not publicly accessible

- [ ] **Set all production environment variables:**
  ```bash
  NODE_ENV=production
  CLIENT_ORIGIN=https://your-domain.com
  DATABASE_URL=<production-db-url>
  JWT_SECRET=<strong-secret-here>
  ```

---

## 🟡 RECOMMENDED - Should Do

- [ ] Add HSTS header for production (forces HTTPS)
- [ ] Set up log rotation for `server/logs/`
- [ ] Configure monitoring/alerting for security logs
- [ ] Set up automated backups for database
- [ ] Document incident response procedure

---

## Authentication Security

✅ **Implemented:**
- Passwords hashed with bcrypt (cost factor 10)
- JWT tokens expire after 7 days
- Login rate limited (5 attempts / 15 min)
- Failed login attempts logged
- No secrets exposed to frontend

⚠️ **Verify:**
- [ ] JWT_SECRET is strong and unique in production

---

## Authorization & Access Control

✅ **Implemented:**
- Role-based authorization middleware
- IDOR protection on all user-owned resources
- Coordinator event assignment verification
- All role-specific endpoints protected
- Unauthorized access attempts logged

⚠️ **Test:**
- [ ] Users can only access their own registrations
- [ ] Coordinators can only scan/submit for assigned events
- [ ] Role-restricted endpoints reject unauthorized users

---

## Rate Limiting & Abuse Protection

✅ **Implemented:**
| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 attempts | 15 minutes |
| Registration | 3 attempts | 1 hour |
| QR Scans | 30 scans | 1 minute |
| Exports | 10 exports | 1 hour |
| API (general) | 100 requests | 15 minutes |

⚠️ **Monitor:**
- [ ] Check logs for rate limit violations
- [ ] Adjust limits based on legitimate traffic patterns

---

## Input Validation

✅ **Implemented:**
- Email format validation
- Phone number validation (Indian format)
- Registration code format (TA-YYYY-XXXXX)
- Transaction ID validation
- UUID validation
- XSS prevention (HTML tag removal)

⚠️ **Review:**
- [ ] All user inputs pass through validation
- [ ] Error messages don't expose sensitive info

---

## Security Headers

✅ **Implemented:**
```http
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

⚠️ **Add for Production:**
```javascript
// In server/index.js (production only)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}
```

---

## Logging & Monitoring

✅ **Implemented:**
- Failed login attempts
- IDOR attempts
- Suspicious activity (wrong event scans)
- Security events (exports, submissions)
- Access logs

⚠️ **Set Up:**
- [ ] Log rotation (prevent disk space issues)
- [ ] Log monitoring/alerting
- [ ] Regular log reviews

**Log Locations:**
- `server/logs/security.log` - Security events
- `server/logs/access.log` - Access logs

---

## File Upload Security

✅ **Implemented:**
- Allowed types: PNG, JPEG, WEBP only
- Max size: 5MB
- Content-type + magic number validation
- Sanitized filenames

⚠️ **Verify:**
- [ ] Upload directory has proper permissions
- [ ] Uploaded files are not executable
- [ ] Virus scanning (if applicable)

---

## Database Security

✅ **Implemented:**
- Prisma ORM (parameterized queries)
- No raw SQL queries
- Environment variable for connection string

⚠️ **Verify:**
- [ ] DATABASE_URL is in `.env` (not committed)
- [ ] Database uses SSL/TLS
- [ ] Regular backups configured
- [ ] Access restricted to application only

---

## Secrets Management

✅ **Secure:**
- All secrets in environment variables
- `.env` in `.gitignore`
- No secrets in git history
- No secrets in frontend code

⚠️ **Verify:**
- [ ] `.env` file not committed
- [ ] Production secrets different from development
- [ ] Secrets rotated regularly

---

## CORS Configuration

✅ **Implemented:**
```javascript
cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
})
```

⚠️ **Verify:**
- [ ] CLIENT_ORIGIN set correctly in production
- [ ] No wildcard (`*`) origins in production
- [ ] Credentials enabled only if needed

---

## Testing Checklist

### Authentication Tests
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password fails
- [ ] Login rate limit kicks in after 5 failures
- [ ] JWT token expires after 7 days
- [ ] Protected routes reject unauthenticated requests

### Authorization Tests
- [ ] Users can only view their own registrations
- [ ] Users cannot access other users' registrations (IDOR test)
- [ ] Coordinators can only scan their assigned events
- [ ] Role-restricted endpoints reject wrong roles
- [ ] Admin-only endpoints reject non-admins

### Input Validation Tests
- [ ] Invalid email format rejected
- [ ] Invalid phone number rejected
- [ ] XSS attempts sanitized (try `<script>alert('xss')</script>`)
- [ ] SQL injection attempts blocked (try `' OR '1'='1`)
- [ ] Oversized inputs rejected

### Rate Limiting Tests
- [ ] Login rate limit triggers after 5 attempts
- [ ] Registration rate limit triggers after 3 attempts
- [ ] QR scan rate limit triggers after 30 scans/min
- [ ] API rate limit triggers after 100 requests/15min

---

## Security Monitoring

### Daily
- [ ] Review `server/logs/security.log` for anomalies
- [ ] Check for repeated failed login attempts
- [ ] Monitor IDOR attempt logs

### Weekly
- [ ] Review all security event logs
- [ ] Check rate limit violations
- [ ] Verify log file sizes (rotate if needed)

### Monthly
- [ ] Audit user permissions and roles
- [ ] Review and update security policies
- [ ] Check for npm package vulnerabilities: `npm audit`

---

## Incident Response

### If Breach Suspected:
1. **Immediately rotate JWT_SECRET**
2. **Invalidate all active sessions**
3. **Review security logs for breach timeline**
4. **Identify compromised accounts**
5. **Notify affected users**
6. **Document incident and response**

### If Rate Limit Triggered:
1. **Check logs for attacker IP**
2. **Verify if legitimate traffic or attack**
3. **Adjust rate limits if needed**
4. **Consider IP-based blocking for persistent attackers**

### If IDOR Attempt Detected:
1. **Review security logs for userId and attempted access**
2. **Verify IDOR protection is working**
3. **Check for pattern of attempts (targeted vs random)**
4. **Consider temporary account suspension if persistent**

---

## npm Security

### Before Deployment
```bash
# Check for vulnerabilities
npm audit

# Fix automatically if possible
npm audit fix

# Review manual fixes
npm audit fix --force  # Use with caution
```

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Test updates in staging before production

---

## Quick Security Commands

```bash
# Generate strong secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Search for hardcoded secrets
grep -r -i "password\|secret\|key\|token" server/ --exclude-dir=node_modules --exclude-dir=logs

# Check git history for secrets
git log -p | grep -i "password\|secret\|key\|token"

# Check npm vulnerabilities
npm audit

# View security logs
tail -f server/logs/security.log

# View access logs
tail -f server/logs/access.log
```

---

## Emergency Contacts

**Security Issues:**
- Lead Developer: [contact info]
- System Administrator: [contact info]
- Hosting Support: Render/Vercel support

**Incident Response:**
1. Document the issue
2. Notify security team immediately
3. Follow incident response procedure
4. Preserve logs and evidence

---

## References

- **OWASP Top 10:** https://owasp.org/Top10/
- **Security Headers:** https://securityheaders.com/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725
- **bcrypt Documentation:** https://github.com/kelektiv/node.bcrypt.js

---

**Last Updated:** September 21, 2026  
**Version:** 1.0  
**Maintained By:** Security Team
