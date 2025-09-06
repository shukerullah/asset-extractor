# 🛡️ Security Policy

## Reporting Security Vulnerabilities

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email us directly at: [security@yourproject.com] 
3. Include detailed information about the vulnerability
4. Provide steps to reproduce the issue

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

## Security Measures

### Frontend Security
- ✅ **Content Security Policy**: Configured via middleware
- ✅ **XSS Protection**: Headers set to prevent cross-site scripting
- ✅ **CSRF Protection**: Built-in Next.js protections
- ✅ **Input Validation**: File type and size validation

### Backend Security  
- ✅ **Input Sanitization**: File validation and processing limits
- ✅ **Rate Limiting**: Can be configured per deployment needs
- ✅ **Error Handling**: No sensitive information exposed in errors
- ✅ **Dependency Security**: Regular updates and security scanning

### Infrastructure Security
- ✅ **HTTPS Enforced**: All traffic encrypted
- ✅ **Environment Isolation**: Secrets managed via platform variables
- ✅ **Automatic Updates**: Platform-managed security patches

## Best Practices for Deployment

### Environment Variables
- Never commit `.env.local` files to git
- Use platform-specific secret management (Railway, Vercel)
- Rotate keys regularly

### Network Security
- Configure CORS properly for your domains
- Use Railway/Vercel built-in DDoS protection
- Monitor for unusual traffic patterns

### Dependencies
- Regularly update dependencies: `npm audit fix`
- Monitor for security advisories
- Use `npm ci` in production for exact dependency versions

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## Security Updates

We will provide security updates for the current major version. Critical security fixes will be backported when possible.

---

Thank you for helping keep Asset Extractor secure! 🙏