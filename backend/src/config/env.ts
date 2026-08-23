import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string(),

  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),

  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  FRONTEND_URL: z
    .string()
    .default("http://localhost:3000"),

  BCRYPT_ROUNDS: z.coerce.number().default(12),


  B2_ENDPOINT: z.string(),

  B2_BUCKET_NAME: z.string(),

  B2_APPLICATION_KEY_ID: z.string(),

  B2_APPLICATION_KEY: z.string(),

  B2_REGION: z.string().default("us-west-004"),
});

export const env = envSchema.parse(process.env);