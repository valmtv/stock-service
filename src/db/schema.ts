import { pgTable, text, integer, timestamp, primaryKey, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const wallets = pgTable('wallets', {
  id: text('id').primaryKey(),
});

export const bankStocks = pgTable(
  'bank_stocks',
  {
    stockName: text('stock_name').primaryKey(),
    quantity: integer('quantity').notNull(),
  },
  (table) => [check('bank_quantity_chk', sql`${table.quantity} >= 0`)],
);

export const walletStocks = pgTable(
  'wallet_stocks',
  {
    walletId: text('wallet_id')
      .notNull()
      .references(() => wallets.id),
    stockName: text('stock_name').notNull(),
    quantity: integer('quantity').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.walletId, table.stockName] }),
    check('wallet_quantity_chk', sql`${table.quantity} >= 0`),
  ],
);

export const auditLog = pgTable('audit_log', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  type: text('type').notNull(), // "buy" | "sell"
  walletId: text('wallet_id').notNull(),
  stockName: text('stock_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
