/**
 * rateLimit.js - Rate Limiting Middleware
 *
 * Provides rate limiting middleware for API endpoints to prevent abuse.
 * Currently both limiters are set to passthrough mode (disabled) for
 * development. In production, these should be replaced with express-rate-limit
 * configurations to throttle requests per IP.
 *
 * Available limiters:
 *  - apiLimiter: Applied to all /api/ routes (general rate limit)
 *  - authLimiter: Applied to auth routes (stricter limit to prevent brute force)
 */

// Passthrough — rate limiting is temporarily disabled for development
const apiLimiter = (req, res, next) => next();
const authLimiter = (req, res, next) => next();

module.exports = { apiLimiter, authLimiter };
