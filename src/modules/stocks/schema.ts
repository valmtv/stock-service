import { z } from 'zod';
import { errorResponseSchema } from '../../shared/schema.js';

const stockItemSchema = z.object({
  name: z.string().describe('Name of the stock'),
  quantity: z.number().int().min(0).describe('Quantity of the stock'),
});

export const getStocksResponseSchema = z.object({
  stocks: z.array(stockItemSchema),
});

export const postStocksBodySchema = z.object({
  stocks: z.array(stockItemSchema),
});

export const getStocksRouteSchema = {
  description: 'Returns the current state of the bank',
  tags: ['Stocks'],
  response: {
    200: getStocksResponseSchema,
  },
};

export const postStocksRouteSchema = {
  description: 'Sets the current state of the bank (overwrites existing state)',
  tags: ['Stocks'],
  body: postStocksBodySchema,
  response: {
    200: z.object({ success: z.boolean() }),
    400: errorResponseSchema,
    500: errorResponseSchema,
  },
};
