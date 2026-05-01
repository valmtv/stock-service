import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../../db/client.js';
import { bankStocks } from '../../db/schema.js';
import { getStocksRouteSchema, postStocksRouteSchema } from './schema.js';

// eslint-disable-next-line @typescript-eslint/require-await -- Fastify async plugin forces async to be used
export const stocksRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/', { schema: getStocksRouteSchema }, async (request, reply) => {
    const records = await db.select().from(bankStocks);

    const stocks = records.map((record) => ({
      name: record.stockName,
      quantity: record.quantity,
    }));

    return reply.status(200).send({ stocks });
  });

  fastify.post('/', { schema: postStocksRouteSchema }, async (request, reply) => {
    const { stocks } = request.body;

    await db.transaction(async (tx) => {
      await tx.delete(bankStocks);

      if (stocks.length > 0) {
        const insertData = stocks.map((stock) => ({
          stockName: stock.name,
          quantity: stock.quantity,
        }));
        await tx.insert(bankStocks).values(insertData);
      }
    });

    return reply.status(200).send({ success: true });
  });
};
