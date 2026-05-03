import { z } from 'zod';

// Standard Fastify error format for Swagger documentation
export const errorResponseSchema = z.object({
  message: z.string(),
  error: z.string(),
  statusCode: z.number(),
});
