import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../../db/client.js';
import { wallets } from '../../db/schema.js';
import { postWalletsRouteSchema } from './schema.js';

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
};
