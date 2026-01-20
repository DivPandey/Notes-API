const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user and return API key', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('apiKey');
      expect(res.body.data.username).toBe(userData.username);
      expect(res.body.data.email).toBe(userData.email);
      expect(res.body.data.apiKey).toMatch(/^napi_/);
    });

    it('should return 400 for duplicate email', async () => {
      await User.create({
        username: 'existinguser',
        email: 'test@example.com',
        apiKey: 'napi_test123'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'test@example.com'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already registered');
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'invalid-email'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation error');
    });

    it('should return 400 for missing username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        apiKey: 'napi_' + 'a'.repeat(64)
      });
    });

    it('should return user info with valid API key', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('x-api-key', testUser.apiKey)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('testuser');
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should return 401 without API key', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('API key is required');
    });

    it('should return 401 with invalid API key', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('x-api-key', 'invalid_key')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid API key');
    });
  });

  describe('POST /api/auth/regenerate', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        apiKey: 'napi_' + 'a'.repeat(64)
      });
    });

    it('should regenerate API key', async () => {
      const oldApiKey = testUser.apiKey;

      const res = await request(app)
        .post('/api/auth/regenerate')
        .set('x-api-key', testUser.apiKey)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.apiKey).not.toBe(oldApiKey);
      expect(res.body.data.apiKey).toMatch(/^napi_/);
    });
  });
});
