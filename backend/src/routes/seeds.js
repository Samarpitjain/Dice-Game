import express from 'express';
import { getSeedHash, resetServerSeed, updateClientSeed, getSeedHistory, unhashServerSeed } from '../controllers/seedController.js';
import { authenticateToken } from '../middleware/auth.js';
import { createRateLimitMiddleware, seedRateLimiter } from '../middleware/rateLimiter.js';
import { sanitizeInput, validateClientSeed } from '../middleware/sanitize.js';

const router = express.Router();

router.get('/hash', authenticateToken, getSeedHash);
router.post('/reset', 
  authenticateToken, 
  createRateLimitMiddleware(seedRateLimiter), 
  resetServerSeed
);
router.post('/client', sanitizeInput, validateClientSeed, authenticateToken, updateClientSeed);
router.get('/history', authenticateToken, getSeedHistory);
router.post('/unhash', unhashServerSeed);

export default router;