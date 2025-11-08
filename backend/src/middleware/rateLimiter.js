import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter for bet placement
export const betRateLimiter = new RateLimiterMemory({
  keyPrefix: 'bet_limit',
  points: 120, // 120 bets
  duration: 60, // per 60 seconds
});

// Rate limiter for seed operations
export const seedRateLimiter = new RateLimiterMemory({
  keyPrefix: 'seed_limit',
  points: 10, // 10 operations
  duration: 3600, // per 1 hour
});

export const createRateLimitMiddleware = (limiter) => {
  return async (req, res, next) => {
    try {
      const key = req.user?.id || req.ip;
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: secs
      });
    }
  };
};