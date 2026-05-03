import { z } from 'zod';

export const getLogRouteSchema = {
  description: 'Returns the entire audit log in order of occurrence',
  tags: ['Log'],
  response: {
    200: z.object({
      log: z.array(
        z.object({
          type: z.enum(['buy', 'sell']),
          wallet_id: z.string(),
          stock_name: z.string(),
        }),
      ),
    }),
    500: z.object({
      error: z.string(),
    }),
  },
};
