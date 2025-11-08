/**
 * Client-side fairness verification using Web Crypto API
 */

async function hmacSha256(key, message) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify roll using Stake's official provably fair algorithm
 * @param {string} serverSeed - The raw server seed (unhashed)
 * @param {string} clientSeed - The client seed string
 * @param {number} nonce - Nonce counter
 * @returns {number} Roll result in the range 0.00–99.99
 */
export async function verifyRoll(serverSeed, clientSeed, nonce) {
  try {
    const input = `${clientSeed}:${nonce}`;
    const hmac = await hmacSha256(serverSeed, input);

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
  } catch (error) {
    console.error('Verification error:', error);
    throw new Error('Failed to verify roll');
  }
}

export function sha256(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  return crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  });
}

export function generateClientSeed() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export function calculatePayout(winChance, houseEdge = 0.01) {
  const probability = winChance / 100;
  const rawMultiplier = 1 / probability;
  return rawMultiplier * (1 - houseEdge);
}