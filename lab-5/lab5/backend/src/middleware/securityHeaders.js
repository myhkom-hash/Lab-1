// src/middleware/securityHeaders.js
// Лаб 5 — Сценарій Г: Security Misconfiguration

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Demo-Security', 'lab5-hardened');
  next();
}

module.exports = { securityHeaders };
