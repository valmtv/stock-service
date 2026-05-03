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
  description:
    'Sets the current state of wallets AND cleans all stocks in wallets and audit log (overwrites existing state)',
  tags: ['Wallets'],
  body: postWalletsBodySchema,
  response: {
    200: z.object({ success: z.boolean() }),
    400: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const getWalletParamsSchema = z.object({
  wallet_id: z.string().describe('ID of the wallet'),
});

export const getWalletRouteSchema = {
  description: 'Returns the current state of the particular wallet',
  tags: ['Wallets'],
  params: getWalletParamsSchema,
  response: {
    200: z.object({
      id: z.string(),
      stocks: z.array(
        z.object({
          name: z.string(),
          quantity: z.number().int(),
        }),
      ),
    }),
    404: errorResponseSchema,
  },
};

export const WalletStockParamsSchema = z.object({
  wallet_id: z.string().describe('ID of the wallet'),
  stock_name: z.string().describe('Name of the stock'),
});

export const getWalletStockRouteSchema = {
  description: 'Returns quantity of the specified stock in the specified wallet',
  tags: ['Wallets'],
  params: WalletStockParamsSchema,
  response: {
    200: z.number().int(),
    404: errorResponseSchema,
  },
};

export const postWalletStockRouteSchema = {
  description: 'Simulates sell or buy of a single stock',
  tags: ['Wallets'],
  params: WalletStockParamsSchema,
  body: z.object({
    type: z.enum(['buy', 'sell']),
  }),
  response: {
    200: z.object({ success: z.boolean() }),
    400: errorResponseSchema,
    404: errorResponseSchema,
  },
};
