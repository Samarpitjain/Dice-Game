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

export async function verifyRoll(serverSeed, clientSeed, nonce) {
  try {
    const msg = `${clientSeed}:${nonce}`;
    const hmac = await hmacSha256(serverSeed, msg);
    const first8 = hmac.slice(0, 8);
    const intVal = parseInt(first8, 16);
    const float = intVal / 0xffffffff;
    const roll = Math.floor(float * 10001) / 100;
    return Number(roll.toFixed(2));
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