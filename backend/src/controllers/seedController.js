import User from '../models/User.js';
import SeedRotation from '../models/SeedRotation.js';
import { FairnessService } from '../services/FairnessService.js';
import { generateServerSeed, hashServerSeed } from '../utils/rng.js';

export const getSeedHash = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      serverSeedHash: user.serverSeedHash,
      clientSeed: user.clientSeed,
      nonce: user.nonce
    });
  } catch (error) {
    console.error('Get seed hash error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetServerSeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store old seed for reveal
    const seedRotation = new SeedRotation({
      userId,
      oldServerSeed: user.serverSeed,
      oldServerSeedHash: user.serverSeedHash
    });

    // Generate new server seed
    const newServerSeed = generateServerSeed();
    const newServerSeedHash = hashServerSeed(newServerSeed);

    // Update user with new seed
    user.serverSeed = newServerSeed;
    user.serverSeedHash = newServerSeedHash;
    user.serverSeedRevealedAt = new Date();
    user.nonce = 0;

    await Promise.all([seedRotation.save(), user.save()]);

    res.json({
      newServerSeedHash: newServerSeedHash,
      message: 'Server seed rotated successfully. Previous seed saved to history.'
    });
  } catch (error) {
    console.error('Reset server seed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateClientSeed = async (req, res) => {
  try {
    const { clientSeed } = req.body;
    const userId = req.user.id;

    const result = await FairnessService.updateClientSeed(userId, clientSeed);
    
    res.json({
      clientSeed: result.clientSeed,
      message: 'Client seed updated successfully'
    });
  } catch (error) {
    console.error('Update client seed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSeedHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    
    const history = await FairnessService.getSeedHistory(userId, limit);
    res.json({ history });
  } catch (error) {
    console.error('Get seed history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unhashServerSeed = async (req, res) => {
  try {
    const { serverSeedHash } = req.body;
    const result = await FairnessService.unhashServerSeed(serverSeedHash);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};