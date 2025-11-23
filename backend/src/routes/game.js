import express from 'express';
import { placeBet, getBetHistory, verifyBet, getGameConfig, addBalance } from '../controllers/gameController.js';
import { authenticateToken } from '../middleware/auth.js';
import { createRateLimitMiddleware, betRateLimiter } from '../middleware/rateLimiter.js';
import { sanitizeInput } from '../middleware/sanitize.js';

const router = express.Router();

router.post('/roll', 
  sanitizeInput,
  authenticateToken, 
  createRateLimitMiddleware(betRateLimiter), 
  placeBet
);

router.get('/history', authenticateToken, getBetHistory);
router.get('/verify', verifyBet);
router.get('/config', getGameConfig);
router.post('/add-balance', authenticateToken, addBalance);

export default router;