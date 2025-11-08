import crypto from 'crypto';

/**
 * Generate provably fair dice roll using HMAC-SHA256
 * @param {string} serverSeed - Server seed (64 bytes hex)
 * @param {string} clientSeed - Client seed
 * @param {number} nonce - Nonce counter
 * @returns {number} Roll result (0.00 - 100.00)
 */
export function generateRoll(serverSeed, clientSeed, nonce) {
  const msg = `${clientSeed}:${nonce}`;
  const hmac = crypto.createHmac('sha256', serverSeed).update(msg).digest('hex');
  const first8 = hmac.slice(0, 8);
  const intVal = parseInt(first8, 16);
  const float = intVal / 0xffffffff;
  const roll = Math.floor(float * 10001) / 100;
  return Number(roll.toFixed(2));
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