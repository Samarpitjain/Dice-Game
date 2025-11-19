import crypto from 'crypto';
import User from '../models/User.js';
import Bet from '../models/Bet.js';
import SeedRotation from '../models/SeedRotation.js';
import { FairnessService } from '../services/FairnessService.js';
import { calculatePayout, winChanceToTarget } from '../utils/rng.js';

export const placeBet = async (req, res) => {
  try {
    const { betAmount, target, direction } = req.body;
    const userId = req.user.id;

    // Validation
    const maxBet = parseFloat(process.env.MAX_BET) || 10000;
    if (!betAmount || betAmount < 0.01 || betAmount > maxBet) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }
    
    // Convert bet amount to cents for internal calculation
    const betAmountCents = Math.round(betAmount * 100);

    if (!target || target < 0.01 || target > 99.99) {
      return res.status(400).json({ error: 'Invalid target' });
    }

    if (!['over', 'under'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid direction' });
    }

    // Get user and lock for atomic update
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.balance < betAmountCents) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Store current nonce before increment
    const currentNonce = user.nonce;

    // Calculate win chance
    const winChance = direction === 'under' ? target : 100 - target;
    if (winChance < 0.01 || winChance > 95.00) {
      return res.status(400).json({ error: 'Invalid win chance' });
    }

    // Generate roll using FairnessService
    const roll = FairnessService.generateRoll(user.serverSeed, user.clientSeed, user.nonce);
    
    // Determine win/loss
    const win = direction === 'under' ? roll < target : roll > target;
    
    // Calculate payout in cents
    const payoutMultiplier = calculatePayout(winChance);
    const payoutCents = win ? Math.round(betAmountCents * payoutMultiplier) : 0;
    const profitCents = payoutCents - betAmountCents;

    // Generate HMAC for verification
    const msg = `${user.clientSeed}:${user.nonce}`;
    const hmac = crypto.createHmac('sha256', user.serverSeed).update(msg).digest('hex');

    // Extract bet metadata from request
    const { betType = 'manual', roundNumber, strategy } = req.body;

    // Create bet record
    const bet = new Bet({
      userId,
      betAmount: betAmountCents,
      direction,
      target,
      winChance,
      payout: payoutCents,
      payoutMultiplier: Number(payoutMultiplier.toFixed(4)),
      win,
      profit: profitCents,
      roll,
      nonce: currentNonce,
      serverSeedHash: user.serverSeedHash,
      hmac,
      clientSeed: user.clientSeed,
      betType,
      roundNumber,
      strategy
    });

    // Save bet first
    await bet.save();
    
    // Atomically update user balance and increment nonce
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { nonce: 1, balance: profitCents }
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    // Emit to socket for real-time updates
    const betObject = bet.toObject();
    req.io.to(`user:${userId}`).emit('betResult', {
      bet: {
        ...betObject,
        betAmount: betObject.betAmount / 100,
        payout: betObject.payout / 100,
        profit: betObject.profit / 100
      },
      newBalance: updatedUser.balance / 100,
      newNonce: updatedUser.nonce
    });

    res.json({
      roll,
      win,
      payout: payoutCents / 100, // Convert to decimal
      profit: profitCents / 100, // Convert to decimal
      newBalance: updatedUser.balance / 100, // Convert to decimal
      newNonce: updatedUser.nonce,
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

    // Convert cents to dollars for display
    const formattedBets = bets.map(bet => ({
      ...bet,
      betAmount: bet.betAmount / 100,
      payout: bet.payout / 100,
      profit: bet.profit / 100
    }));

    res.json({ bets: formattedBets });
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

    const roll = FairnessService.verifyRoll(serverSeed, clientSeed, parseInt(nonce));
    
    res.json({ roll });
  } catch (error) {
    console.error('Verify bet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGameConfig = async (req, res) => {
  try {
    const maxBet = parseFloat(process.env.MAX_BET) || 10000;
    res.json({ maxBet });
  } catch (error) {
    console.error('Get game config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};