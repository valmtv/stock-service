import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { asc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { auditLog } from '../../db/schema.js';
import { getLogRouteSchema } from './schema.js';

// eslint-disable-next-line @typescript-eslint/require-await
export const logRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get('/', { schema: getLogRouteSchema }, async (request, reply) => {
    const records = await db
      .select({
        type: auditLog.type,
        wallet_id: auditLog.walletId,
        stock_name: auditLog.stockName,
      })
      .from(auditLog)
      .orderBy(asc(auditLog.id)); // Ensures chronological order

    return reply.status(200).send({ log: records });
  });
};
