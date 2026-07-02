# Security Policy

## Supported Version

Architect-Prime v1.x receives security fixes for the primary runnable Node.js TypeScript module and documentation/security workflow issues.

## Reporting a Vulnerability

Please open a private security advisory on GitHub or contact the repository owner. Do not disclose exploitable details publicly before a fix is available.

## Security Baseline

- JWT secrets must be provided through environment variables in production.
- Demo credentials in documentation are local-development only.
- Passwords are hashed with bcrypt in Node.js and Laravel modules.
- CI runs dependency audit and secret scanning.
