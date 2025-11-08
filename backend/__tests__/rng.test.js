import { generateRoll, calculatePayout, winChanceToTarget } from '../src/utils/rng.js';

describe('RNG Functions', () => {
  test('generateRoll produces deterministic results', () => {
    const serverSeed = 'a'.repeat(128);
    const clientSeed = 'test';
    const nonce = 0;

    const roll1 = generateRoll(serverSeed, clientSeed, nonce);
    const roll2 = generateRoll(serverSeed, clientSeed, nonce);

    expect(roll1).toBe(roll2);
    expect(typeof roll1).toBe('number');
    expect(roll1).toBeGreaterThanOrEqual(0);
    expect(roll1).toBeLessThanOrEqual(100);
  });

  test('generateRoll produces different results with different nonces', () => {
    const serverSeed = 'a'.repeat(128);
    const clientSeed = 'test';

    const roll1 = generateRoll(serverSeed, clientSeed, 0);
    const roll2 = generateRoll(serverSeed, clientSeed, 1);

    expect(roll1).not.toBe(roll2);
  });

  test('calculatePayout returns correct multiplier', () => {
    const payout50 = calculatePayout(50, 0.01);
    expect(payout50).toBeCloseTo(1.98, 2);

    const payout25 = calculatePayout(25, 0.01);
    expect(payout25).toBeCloseTo(3.96, 2);
  });

  test('winChanceToTarget converts correctly', () => {
    expect(winChanceToTarget(50, 'under')).toBe(50);
    expect(winChanceToTarget(50, 'over')).toBe(50);
    expect(winChanceToTarget(25, 'under')).toBe(25);
    expect(winChanceToTarget(25, 'over')).toBe(75);
  });

  test('roll format has exactly 2 decimal places', () => {
    const serverSeed = 'b'.repeat(128);
    const clientSeed = 'format-test';
    
    for (let i = 0; i < 100; i++) {
      const roll = generateRoll(serverSeed, clientSeed, i);
      const rollStr = roll.toString();
      const decimalIndex = rollStr.indexOf('.');
      
      if (decimalIndex !== -1) {
        const decimals = rollStr.substring(decimalIndex + 1);
        expect(decimals.length).toBeLessThanOrEqual(2);
      }
    }
  });
});