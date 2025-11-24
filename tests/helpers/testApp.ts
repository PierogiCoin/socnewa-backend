import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Create a minimal test app that mimics the main app structure
export function createTestApp() {
  const app = express();
  
  app.set('trust proxy', 1);
  app.use(cors());
  app.use(express.json());

  // Minimal rate limiter for tests
  const testLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // High limit for tests
    standardHeaders: true,
    legacyHeaders: false
  });

  app.use(testLimiter);

  return app;
}
