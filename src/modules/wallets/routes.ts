import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { wallets, walletStocks } from '../../db/schema.js';
import { getWalletRouteSchema, postWalletsRouteSchema } from './schema.js';

// eslint-disable-next-line @typescript-eslint/require-await
export const walletsRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.post('/', { schema: postWalletsRouteSchema }, async (request, reply) => {
    const { wallets: newWallets } = request.body;

    await db.transaction(async (tx) => {
      await tx.delete(wallets);

      if (newWallets.length > 0) {
        const insertData = newWallets.map((wallet) => ({
          id: wallet.id,
        }));
        await tx.insert(wallets).values(insertData);
      }
    });

    return reply.status(200).send({ success: true });
  });

  fastify.get('/:wallet_id', { schema: getWalletRouteSchema }, async (request, reply) => {
    const { wallet_id } = request.params;

    const walletRecord = await db.select().from(wallets).where(eq(wallets.id, wallet_id)).limit(1); // Anyway only one record should be returned due to PK, but lets give others a note about this

    if (walletRecord.length === 0) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Wallet not found',
      });
    }

    const stocksRecords = await db
      .select({
        name: walletStocks.stockName,
        quantity: walletStocks.quantity,
      })
      .from(walletStocks)
      .where(eq(walletStocks.walletId, wallet_id));

    const filteredStocks = stocksRecords.filter((stock) => stock.quantity > 0);

    return reply.status(200).send({
      id: wallet_id,
      stocks: filteredStocks,
    });
  });
};
