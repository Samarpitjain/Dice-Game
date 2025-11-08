import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/server.js';
import User from '../src/models/User.js';

describe('API Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/dice-game-test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
  });

  describe('Auth Endpoints', () => {
    test('POST /api/auth/login should create new user and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.balance).toBe(1000);

      authToken = response.body.token;
      userId = response.body.user.id;
    });

    test('POST /api/auth/login should return existing user', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });

      // Login again
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' })
        .expect(200);

      expect(response.body.user.username).toBe('testuser');
    });

    test('GET /api/auth/profile should return user profile', async () => {
      // Create user and get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200);

      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user).not.toHaveProperty('serverSeed');
    });
  });

  describe('Game Endpoints', () => {
    beforeEach(async () => {
      // Create user and get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });
      
      authToken = loginResponse.body.token;
      userId = loginResponse.body.user.id;
    });

    test('POST /api/game/roll should place bet successfully', async () => {
      const response = await request(app)
        .post('/api/game/roll')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          betAmount: 10,
          target: 50,
          direction: 'under'
        })
        .expect(200);

      expect(response.body).toHaveProperty('roll');
      expect(response.body).toHaveProperty('win');
      expect(response.body).toHaveProperty('payout');
      expect(response.body).toHaveProperty('newBalance');
      expect(response.body.roll).toBeGreaterThanOrEqual(0);
      expect(response.body.roll).toBeLessThanOrEqual(100);
    });

    test('POST /api/game/roll should validate bet amount', async () => {
      await request(app)
        .post('/api/game/roll')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          betAmount: 0,
          target: 50,
          direction: 'under'
        })
        .expect(400);
    });

    test('GET /api/game/history should return bet history', async () => {
      // Place a bet first
      await request(app)
        .post('/api/game/roll')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          betAmount: 10,
          target: 50,
          direction: 'under'
        });

      const response = await request(app)
        .get('/api/game/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('bets');
      expect(Array.isArray(response.body.bets)).toBe(true);
      expect(response.body.bets.length).toBe(1);
    });

    test('GET /api/game/verify should verify roll', async () => {
      const response = await request(app)
        .get('/api/game/verify')
        .query({
          serverSeed: 'a'.repeat(128),
          clientSeed: 'test',
          nonce: 0
        })
        .expect(200);

      expect(response.body).toHaveProperty('roll');
      expect(typeof response.body.roll).toBe('number');
    });
  });

  describe('Seed Endpoints', () => {
    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });
      
      authToken = loginResponse.body.token;
    });

    test('GET /api/seeds/hash should return seed info', async () => {
      const response = await request(app)
        .get('/api/seeds/hash')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('serverSeedHash');
      expect(response.body).toHaveProperty('clientSeed');
      expect(response.body).toHaveProperty('nonce');
    });

    test('POST /api/seeds/reset should rotate server seed', async () => {
      const response = await request(app)
        .post('/api/seeds/reset')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('oldServerSeed');
      expect(response.body).toHaveProperty('newServerSeedHash');
    });

    test('POST /api/seeds/client should update client seed', async () => {
      const response = await request(app)
        .post('/api/seeds/client')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ clientSeed: 'new-client-seed' })
        .expect(200);

      expect(response.body.clientSeed).toBe('new-client-seed');
    });
  });
});