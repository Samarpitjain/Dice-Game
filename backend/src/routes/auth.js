import express from 'express';
import { loginDemo, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginDemo);
router.get('/profile', authenticateToken, getProfile);

export default router;