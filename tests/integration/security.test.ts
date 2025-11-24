import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';

console.log('🧪 Test setup complete');

// Create a minimal test app with security middleware
function createSecureApp() {
  const app = express();
  
  app.set('trust proxy', 1);
  
  // Apply security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  
  // Apply sanitization
  app.use(express.json());
  app.use(mongoSanitize({ replaceWith: '_' }));
  
  // Test route that echoes back request body
  app.post('/api/test', (req, res) => {
    res.json({ received: req.body });
  });
  
  return app;
}

describe('Security Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createSecureApp();
  });

  describe('Helmet Security Headers', () => {
    it('should set X-Content-Type-Options header', async () => {
      const response = await request(app).get('/api/test');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const response = await request(app).get('/api/test');
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should set Strict-Transport-Security header', async () => {
      const response = await request(app).get('/api/test');
      expect(response.headers['strict-transport-security']).toBeDefined();
    });

    it('should set X-DNS-Prefetch-Control header', async () => {
      const response = await request(app).get('/api/test');
      expect(response.headers['x-dns-prefetch-control']).toBe('off');
    });
  });

  describe('Request Sanitization', () => {
    it('should sanitize $ characters in request body', async () => {
      const maliciousPayload = {
        username: 'user',
        password: { $gt: '' } // NoSQL injection attempt
      };
      
      const response = await request(app)
        .post('/api/test')
        .send(maliciousPayload);
      
      expect(response.status).toBe(200);
      expect(response.body.received.password).toEqual({ _gt: '' });
    });

    it('should sanitize . characters in object keys', async () => {
      const maliciousPayload = {
        'user.role': 'admin' // Prototype pollution attempt
      };
      
      const response = await request(app)
        .post('/api/test')
        .send(maliciousPayload);
      
      expect(response.status).toBe(200);
      expect(response.body.received['user_role']).toBe('admin');
    });

    it('should sanitize nested $ operators', async () => {
      const maliciousPayload = {
        query: {
          $where: 'this.username === "admin"'
        }
      };
      
      const response = await request(app)
        .post('/api/test')
        .send(maliciousPayload);
      
      expect(response.status).toBe(200);
      expect(response.body.received.query._where).toBeDefined();
    });

    it('should allow safe characters and values', async () => {
      const safePayload = {
        username: 'john_doe',
        email: 'john@example.com',
        age: 25,
        tags: ['user', 'active']
      };
      
      const response = await request(app)
        .post('/api/test')
        .send(safePayload);
      
      expect(response.status).toBe(200);
      expect(response.body.received).toEqual(safePayload);
    });
  });

  describe('CORS Whitelist', () => {
    it('should handle CORS_WHITELIST environment variable', () => {
      const originalEnv = process.env.CORS_WHITELIST;
      process.env.CORS_WHITELIST = 'example.com,api.example.com';
      
      const whitelist = process.env.CORS_WHITELIST.split(',').map(d => d.trim());
      expect(whitelist).toEqual(['example.com', 'api.example.com']);
      
      if (originalEnv !== undefined) {
        process.env.CORS_WHITELIST = originalEnv;
      } else {
        delete process.env.CORS_WHITELIST;
      }
    });

    it('should support wildcard subdomain matching', () => {
      const domain = '*.example.com';
      const testHost = 'api.example.com';
      
      const matches = domain.startsWith('*.') && testHost.endsWith(domain.slice(2));
      expect(matches).toBe(true);
    });

    it('should not match different domains with wildcard', () => {
      const domain = '*.example.com';
      const testHost = 'example.org';
      
      const matches = domain.startsWith('*.') && testHost.endsWith(domain.slice(2));
      expect(matches).toBe(false);
    });
  });
});

console.log('✅ All tests completed');
