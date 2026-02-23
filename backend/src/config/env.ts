import { z } from 'zod';
import dotenv from 'dotenv';

// ok
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().default('your-secret-key'),
  JWT_REFRESH_SECRET: z.string().default('your-refresh-secret-key'),
});

export const config = envSchema.parse(process.env);
