import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter — 100 requests per minute per IP.
 * Returns 429 Too Many Requests when exceeded.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again later', code: 'RATE_LIMITED' },
});

/**
 * Stricter limiter for write operations (create, update, status change).
 * 30 requests per minute per IP.
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many write requests, please slow down', code: 'RATE_LIMITED' },
});
