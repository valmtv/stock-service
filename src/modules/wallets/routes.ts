import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { eq, and, sql } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { wallets, walletStocks, bankStocks, auditLog } from '../../db/schema.js';
import {
  getWalletRouteSchema,
  getWalletStockRouteSchema,
  postWalletsRouteSchema,
  postWalletStockRouteSchema,
} from './schema.js';
import { HttpError } from '../../shared/errors.js';

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

  fastify.get(
    '/:wallet_id/stocks/:stock_name',
    { schema: getWalletStockRouteSchema },
    async (request, reply) => {
      const { wallet_id, stock_name } = request.params;

      const stockRecords = await db
        .select({ quantity: walletStocks.quantity })
        .from(walletStocks)
        .where(and(eq(walletStocks.walletId, wallet_id), eq(walletStocks.stockName, stock_name)))
        .limit(1); // Informational only

      const stock = stockRecords[0];

      if (!stock) {
        return reply.status(200).send(0);
      }

      return reply.status(200).send(stock.quantity);
    },
  );

  fastify.post(
    '/:wallet_id/stocks/:stock_name',
    { schema: postWalletStockRouteSchema },
    async (request, reply) => {
      const { wallet_id, stock_name } = request.params;
      const { type } = request.body;

      try {
        await db.transaction(async (tx) => {
          const bankStockRecords = await tx
            .select()
            .from(bankStocks)
            .where(eq(bankStocks.stockName, stock_name))
            .limit(1);

          const bankStock = bankStockRecords[0];

          if (!bankStock) {
            throw new HttpError(404, 'Stock does not exist in the bank');
          }

          if (type === 'buy') {
            if (bankStock.quantity <= 0) {
              throw new HttpError(400, 'No stock available in the bank to buy');
            }

            await tx.insert(wallets).values({ id: wallet_id }).onConflictDoNothing();

            // Decrement bank
            await tx
              .update(bankStocks)
              .set({ quantity: sql`${bankStocks.quantity} - 1` })
              .where(eq(bankStocks.stockName, stock_name));

            // Increment wallet
            const existingWalletStockRecords = await tx
              .select()
              .from(walletStocks)
              .where(
                and(eq(walletStocks.walletId, wallet_id), eq(walletStocks.stockName, stock_name)),
              )
              .limit(1);

            const existingWalletStock = existingWalletStockRecords[0];

            if (existingWalletStock) {
              await tx
                .update(walletStocks)
                .set({ quantity: sql`${walletStocks.quantity} + 1` })
                .where(
                  and(eq(walletStocks.walletId, wallet_id), eq(walletStocks.stockName, stock_name)),
                );
            } else {
              await tx
                .insert(walletStocks)
                .values({ walletId: wallet_id, stockName: stock_name, quantity: 1 });
            }
          } else if (type === 'sell') {
            const walletRecords = await tx
              .select()
              .from(wallets)
              .where(eq(wallets.id, wallet_id))
              .limit(1);

            if (!walletRecords[0]) {
              throw new HttpError(400, 'Wallet does not exist');
            }

            const walletStockRecords = await tx
              .select()
              .from(walletStocks)
              .where(
                and(eq(walletStocks.walletId, wallet_id), eq(walletStocks.stockName, stock_name)),
              )
              .limit(1);

            const walletStock = walletStockRecords[0];

            if (!walletStock || walletStock.quantity <= 0) {
              throw new HttpError(400, 'No stock in the wallet to sell');
            }

            // Decrement wallet
            await tx
              .update(walletStocks)
              .set({ quantity: sql`${walletStocks.quantity} - 1` })
              .where(
                and(eq(walletStocks.walletId, wallet_id), eq(walletStocks.stockName, stock_name)),
              );

            // Increment bank
            await tx
              .update(bankStocks)
              .set({ quantity: sql`${bankStocks.quantity} + 1` })
              .where(eq(bankStocks.stockName, stock_name));
          }

          // Log the successful operation inside the transaction
          await tx.insert(auditLog).values({
            type: type,
            walletId: wallet_id,
            stockName: stock_name,
          });
        });

        return reply.status(200).send({ success: true });
      } catch (err: unknown) {
        if (err instanceof HttpError) {
          if (err.status === 400) {
            return reply.status(400).send({
              statusCode: 400,
              error: 'Bad Request',
              message: err.message,
            });
          }
          if (err.status === 404) {
            return reply.status(404).send({
              statusCode: 404,
              error: 'Not Found',
              message: err.message,
            });
          }
        }
        throw err;
      }
    },
  );
};
