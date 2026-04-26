import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.string().default('3000'),
});

export const env = schema.parse(process.env);
