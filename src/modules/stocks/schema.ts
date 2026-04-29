import { z } from 'zod';

export const stockArraySchema = z.array(
  z.object({
    name: z.string().min(1),
    quantity: z.number().int().nonnegative(),
  }),
);

export const getStocksResponseSchema = z.object({
  stocks: stockArraySchema,
});

export const postStocksBodySchema = z.object({
  stocks: stockArraySchema,
});

export const successResponseSchema = z.object({
  success: z.boolean(),
});
