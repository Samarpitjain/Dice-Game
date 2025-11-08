import crypto from 'crypto';
import User from '../models/User.js';
import Bet from '../models/Bet.js';
import SeedRotation from '../models/SeedRotation.js';
import { generateRoll, calculatePayout, winChanceToTarget } from '../utils/rng.js';

export const placeBet = async (req, res) => {
  try {
    const { betAmount, target, direction, clientSeed } = req.body;
    const userId = req.user.id;

    // Validation
    if (!betAmount || betAmount < 0.01 || betAmount > 1000) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    if (!target || target < 0.01 || target > 99.99) {
      return res.status(400).json({ error: 'Invalid target' });
    }

    if (!['over', 'under'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid direction' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Calculate win chance
    const winChance = direction === 'under' ? target : 100 - target;
    if (winChance < 0.01 || winChance > 95.00) {
      return res.status(400).json({ error: 'Invalid win chance' });
    }

    // Use provided client seed or user's default
    const effectiveClientSeed = clientSeed || user.clientSeed;
    
    // Generate roll
    const roll = generateRoll(user.serverSeed, effectiveClientSeed, user.nonce);
    
    // Determine win/loss
    const win = direction === 'under' ? roll < target : roll > target;
    
    // Calculate payout
    const payoutMultiplier = calculatePayout(winChance);
    const payout = win ? betAmount * payoutMultiplier : 0;
    const profit = payout - betAmount;

    // Generate HMAC for verification
    const msg = `${effectiveClientSeed}:${user.nonce}`;
    const hmac = crypto.createHmac('sha256', user.serverSeed).update(msg).digest('hex');

    // Create bet record
    const bet = new Bet({
      userId,
      betAmount,
      direction,
      target,
      winChance,
      payout: Number(payout.toFixed(2)),
      win,
      profit: Number(profit.toFixed(2)),
      roll,
      nonce: user.nonce,
      serverSeedHash: user.serverSeedHash,
      hmac,
      clientSeed: effectiveClientSeed
    });

    // Update user balance and nonce
    user.balance = Number((user.balance + profit).toFixed(2));
    user.nonce += 1;

    await Promise.all([bet.save(), user.save()]);

    // Emit to socket for real-time updates
    req.io.to(`user:${userId}`).emit('betResult', {
      bet: bet.toObject(),
      newBalance: user.balance,
      newNonce: user.nonce
    });

    res.json({
      roll,
      win,
      payout: bet.payout,
      profit: bet.profit,
      newBalance: user.balance,
      newNonce: user.nonce,
      serverSeedHash: user.serverSeedHash
    });

  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBetHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = parseInt(req.query.skip) || 0;

    const bets = await Bet.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    res.json({ bets });
  } catch (error) {
    console.error('Get bet history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyBet = async (req, res) => {
  try {
    const { serverSeed, clientSeed, nonce } = req.query;

    if (!serverSeed || !clientSeed || nonce === undefined) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const roll = generateRoll(serverSeed, clientSeed, parseInt(nonce));
    
    res.json({ roll });
  } catch (error) {
    console.error('Verify bet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};