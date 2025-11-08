import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { FairnessService } from '../services/FairnessService.js';

export const loginDemo = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    let user = await User.findOne({ username });

    if (!user) {
      // Create new demo user
      user = new User({
        username,
        balance: 1000.00
      });

      await user.save();
      
      // Initialize seed pair
      await FairnessService.initializeSeedPair(user._id);
      user = await User.findById(user._id);
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        balance: user.balance,
        clientSeed: user.clientSeed,
        serverSeedHash: user.serverSeedHash,
        nonce: user.nonce
      }
    });
  } catch (error) {
    console.error('Login demo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-serverSeed');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        balance: user.balance,
        clientSeed: user.clientSeed,
        serverSeedHash: user.serverSeedHash,
        nonce: user.nonce,
        settings: user.settings
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};