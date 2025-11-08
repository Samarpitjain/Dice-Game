import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter for bet placement
export const betRateLimiter = new RateLimiterMemory({
  keyPrefix: 'bet_limit',
  points: 10, // 10 bets
  duration: 60, // per 60 seconds
});

// Rate limiter for seed operations
export const seedRateLimiter = new RateLimiterMemory({
  keyPrefix: 'seed_limit',
  points: 5, // 5 operations
  duration: 300, // per 5 minutes
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