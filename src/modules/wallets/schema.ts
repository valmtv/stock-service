import { z } from 'zod';
import { errorResponseSchema } from '../../shared/schema.js';

export const postWalletsBodySchema = z.object({
  wallets: z.array(
    z.object({
      id: z.string().describe('ID of the wallet'),
    }),
  ),
});

export const postWalletsRouteSchema = {
  description: 'Sets the current state of all wallets (overwrites existing state)',
  tags: ['Wallets'],
  body: postWalletsBodySchema,
  response: {
    200: z.object({ success: z.boolean() }),
    400: errorResponseSchema,
    500: errorResponseSchema,
  },
};
