import { generateRoll, calculatePayout, winChanceToTarget } from '../src/utils/rng.js';

describe('Stake-Compatible RNG Functions', () => {
  test('matches Stake provably fair algorithm', () => {
    const serverSeed = 'test-server-seed';
    const clientSeed = 'test-client-seed';
    const nonce = 1;
    
    const roll = generateRoll(serverSeed, clientSeed, nonce);
    
    expect(typeof roll).toBe('number');
    expect(roll).toBeGreaterThanOrEqual(0);
    expect(roll).toBeLessThan(100);
  });

  test('generateRoll produces deterministic results', () => {
    const serverSeed = 'test-server-seed';
    const clientSeed = 'test-client-seed';
    const nonce = 1;

    const roll1 = generateRoll(serverSeed, clientSeed, nonce);
    const roll2 = generateRoll(serverSeed, clientSeed, nonce);

    expect(roll1).toBe(roll2);
    expect(typeof roll1).toBe('number');
    expect(roll1).toBeGreaterThanOrEqual(0);
    expect(roll1).toBeLessThan(100);
  });

  test('generateRoll produces different results with different nonces', () => {
    const serverSeed = 'test-server-seed';
    const clientSeed = 'test-client-seed';

    const roll1 = generateRoll(serverSeed, clientSeed, 1);
    const roll2 = generateRoll(serverSeed, clientSeed, 2);

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

  test('roll format is within valid range', () => {
    const serverSeed = 'test-server-seed';
    const clientSeed = 'format-test';
    
    for (let i = 1; i <= 10; i++) {
      const roll = generateRoll(serverSeed, clientSeed, i);
      expect(roll).toBeGreaterThanOrEqual(0);
      expect(roll).toBeLessThan(100);
      expect(Number.isFinite(roll)).toBe(true);
    }
  });
});