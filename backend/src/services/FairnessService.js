import crypto from 'crypto';
import User from '../models/User.js';
import SeedRotation from '../models/SeedRotation.js';

/**
 * Provably Fair Service - Stake.com compatible implementation
 */
export class FairnessService {
  
  /**
   * Generate provably fair dice roll using Stake's algorithm
   */
  static generateRoll(serverSeed, clientSeed, nonce) {
    const input = `${clientSeed}:${nonce}`;
    const hmac = crypto.createHmac('sha256', serverSeed).update(input).digest('hex');

    // Parse HMAC in 5-character chunks to avoid bias
    for (let i = 0; i < hmac.length; i += 5) {
      const segment = hmac.substring(i, i + 5);
      const number = parseInt(segment, 16);

      if (number < 1000000) {
        return (number % 10000) / 100;
      }
    }

    return 99.99;
  }

  /**
   * Generate new server seed
   */
  static generateServerSeed() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash server seed for public display
   */
  static hashServerSeed(serverSeed) {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
  }

  /**
   * Generate random client seed
   */
  static generateClientSeed() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Initialize seed pair for new user
   */
  static async initializeSeedPair(userId) {
    const serverSeed = this.generateServerSeed();
    const clientSeed = this.generateClientSeed();
    const serverSeedHash = this.hashServerSeed(serverSeed);

    await User.findByIdAndUpdate(userId, {
      serverSeed,
      serverSeedHash,
      clientSeed,
      nonce: 1,
      serverSeedRevealedAt: null
    });

    return {
      serverSeedHash,
      clientSeed,
      nonce: 1
    };
  }

  /**
   * Get current seed information (public data only)
   */
  static async getCurrentSeeds(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    return {
      serverSeedHash: user.serverSeedHash,
      clientSeed: user.clientSeed,
      nonce: user.nonce
    };
  }

  /**
   * Update client seed
   */
  static async updateClientSeed(userId, newClientSeed) {
    if (!newClientSeed || typeof newClientSeed !== 'string') {
      throw new Error('Invalid client seed');
    }

    await User.findByIdAndUpdate(userId, { clientSeed: newClientSeed });
    return { clientSeed: newClientSeed };
  }

  /**
   * Rotate server seed (reveal old, generate new, reset nonce)
   */
  static async rotateServerSeed(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Store old seed for revelation
    const oldServerSeed = user.serverSeed;
    const oldServerSeedHash = user.serverSeedHash;

    // Generate new seed pair
    const newServerSeed = this.generateServerSeed();
    const newServerSeedHash = this.hashServerSeed(newServerSeed);

    // Save rotation record
    await SeedRotation.create({
      userId,
      oldServerSeed,
      oldServerSeedHash,
      revealTimestamp: new Date()
    });

    // Update user with new seeds and reset nonce
    await User.findByIdAndUpdate(userId, {
      serverSeed: newServerSeed,
      serverSeedHash: newServerSeedHash,
      nonce: 1,
      serverSeedRevealedAt: new Date()
    });

    return {
      revealedServerSeed: oldServerSeed,
      newServerSeedHash,
      nonce: 1
    };
  }

  /**
   * Verify a roll result
   */
  static verifyRoll(serverSeed, clientSeed, nonce) {
    return this.generateRoll(serverSeed, clientSeed, nonce);
  }

  /**
   * Get seed rotation history
   */
  static async getSeedHistory(userId, limit = 10) {
    return await SeedRotation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('oldServerSeed oldServerSeedHash revealTimestamp');
  }

  /**
   * Unhash a previous server seed (only works for rotated seeds)
   */
  static async unhashServerSeed(serverSeedHash) {
    if (!serverSeedHash) {
      throw new Error('Server seed hash is required');
    }

    // Find the seed rotation record
    const rotation = await SeedRotation.findOne({ oldServerSeedHash: serverSeedHash });
    
    if (!rotation) {
      throw new Error('Server seed hash not found or not yet rotated');
    }

    // Check if this seed is still active (shouldn't be if properly rotated)
    const activeUser = await User.findOne({ serverSeedHash: serverSeedHash });
    if (activeUser) {
      throw new Error('Failed to unhash due to active server seed');
    }

    return {
      serverSeed: rotation.oldServerSeed,
      serverSeedHash: rotation.oldServerSeedHash,
      revealedAt: rotation.revealTimestamp
    };
  }
}