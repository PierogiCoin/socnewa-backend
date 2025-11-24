import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

describe('Rate Limiting Tests', () => {
  it('should enforce rate limits', async () => {
    const app = express();
    app.set('trust proxy', 1);
    
    // Strict rate limiter for testing
    const limiter = rateLimit({
      windowMs: 1000, // 1 second
      max: 3, // max 3 requests per second
      standardHeaders: true,
      legacyHeaders: false
    });

    app.use(limiter);
    app.get('/test', (req, res) => res.json({ success: true }));

    // First 3 requests should succeed
    for (let i = 0; i < 3; i++) {
      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    }

    // 4th request should be rate limited
    const response = await request(app).get('/test');
    expect(response.status).toBe(429);
  });

  it('should include rate limit headers', async () => {
    const app = express();
    app.set('trust proxy', 1);
    
    const limiter = rateLimit({
      windowMs: 60000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false
    });

    app.use(limiter);
    app.get('/test', (req, res) => res.json({ success: true }));

    const response = await request(app).get('/test');
    
    expect(response.headers).toHaveProperty('ratelimit-limit');
    expect(response.headers).toHaveProperty('ratelimit-remaining');
  });

  it('should skip premium users from rate limiting', async () => {
    // Create separate apps to avoid interference
    const createAppWithLimiter = () => {
      const app = express();
      app.set('trust proxy', 1);
      
      const limiter = rateLimit({
        windowMs: 1000,
        max: 1,
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
          const userTier = req.header('x-user-tier');
          return userTier === 'premium';
        }
      });

      app.use(limiter);
      app.get('/test', (req, res) => res.json({ success: true }));
      return app;
    };

    // Test regular user rate limiting
    const regularApp = createAppWithLimiter();
    const firstRegularResponse = await request(regularApp).get('/test');
    expect(firstRegularResponse.status).toBe(200);
    
    const secondRegularResponse = await request(regularApp).get('/test');
    expect(secondRegularResponse.status).toBe(429);

    // Test premium user bypassing rate limits
    const premiumApp = createAppWithLimiter();
    const premiumResponse1 = await request(premiumApp)
      .get('/test')
      .set('x-user-tier', 'premium');
    expect(premiumResponse1.status).toBe(200);

    const premiumResponse2 = await request(premiumApp)
      .get('/test')
      .set('x-user-tier', 'premium');
    expect(premiumResponse2.status).toBe(200);
  });
});
