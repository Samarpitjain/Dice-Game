import crypto from 'crypto';

/**
 * Generate provably fair dice roll using Stake-style HMAC-SHA256 method.
 * Matches Stake.com's official fairness system exactly.
 *
 * @param {string} serverSeed - The raw server seed (unhashed).
 * @param {string} clientSeed - The client seed string.
 * @param {number} nonce - Nonce counter that increments every bet.
 * @returns {number} Roll result in the range 0.00–99.99.
 */
export function generateRoll(serverSeed, clientSeed, nonce) {
  const input = `${clientSeed}:${nonce}`;
  const hmac = crypto.createHmac("sha256", serverSeed).update(input).digest("hex");

  // Parse HMAC hash in 5-character chunks to avoid bias
  for (let i = 0; i < hmac.length; i += 5) {
    const segment = hmac.substring(i, i + 5);
    const number = parseInt(segment, 16);

    // Only accept numbers below 1,000,000 for unbiased distribution
    if (number < 1000000) {
      // Convert number to final roll (0.00 – 99.99)
      return (number % 10000) / 100;
    }
  }

  // Fallback if no valid segment found
  return 99.99;
}

/**
 * Generate random server seed
 * @returns {string} 128 character hex string
 */
export function generateServerSeed() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Generate SHA256 hash of server seed
 * @param {string} serverSeed - Server seed to hash
 * @returns {string} SHA256 hash
 */
export function hashServerSeed(serverSeed) {
  return crypto.createHash('sha256').update(serverSeed).digest('hex');
}

/**
 * Calculate payout multiplier based on win chance
 * @param {number} winChance - Win chance percentage (0.01 - 95.00)
 * @param {number} houseEdge - House edge (default 1%)
 * @returns {number} Payout multiplier
 */
export function calculatePayout(winChance, houseEdge = 0.01) {
  const probability = winChance / 100;
  const rawMultiplier = 1 / probability;
  return rawMultiplier * (1 - houseEdge);
}

/**
 * Convert win chance to target number
 * @param {number} winChance - Win chance percentage
 * @param {string} direction - 'over' or 'under'
 * @returns {number} Target number
 */
export function winChanceToTarget(winChance, direction = 'under') {
  if (direction === 'under') {
    return winChance;
  } else {
    return 100 - winChance;
  }
}