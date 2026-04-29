import type { FastifyPluginCallback } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { db } from '../../db/client.js';
import { bankStocks } from '../../db/schema.js';
import { getStocksResponseSchema, postStocksBodySchema, successResponseSchema } from './schema.js';

export const stockRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get('/', { schema: { response: { 200: getStocksResponseSchema } } }, async (_, reply) => {
    const records = await db.select().from(bankStocks);
    const stocks = records.map((r) => ({ name: r.stockName, quantity: r.quantity }));
    return reply.send({ stocks });
  });

  app.post(
    '/',
    { schema: { body: postStocksBodySchema, response: { 200: successResponseSchema } } },
    async (request, reply) => {
      const { stocks } = request.body;

      await db.transaction(async (tx) => {
        await tx.delete(bankStocks);
        if (stocks.length > 0) {
          await tx
            .insert(bankStocks)
            .values(stocks.map((s) => ({ stockName: s.name, quantity: s.quantity })));
        }
      });

      return reply.send({ success: true });
    },
  );

  done();
};
