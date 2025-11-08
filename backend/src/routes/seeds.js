import express from 'express';
import { getSeedHash, resetServerSeed, updateClientSeed } from '../controllers/seedController.js';
import { authenticateToken } from '../middleware/auth.js';
import { createRateLimitMiddleware, seedRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/hash', authenticateToken, getSeedHash);
router.post('/reset', 
  authenticateToken, 
  createRateLimitMiddleware(seedRateLimiter), 
  resetServerSeed
);
router.post('/client', authenticateToken, updateClientSeed);

export default router;