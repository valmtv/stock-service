CREATE TYPE "public"."audit_type" AS ENUM('buy', 'sell');--> statement-breakpoint
ALTER TABLE "audit_log" ALTER COLUMN "type" SET DATA TYPE "public"."audit_type" USING "type"::"public"."audit_type";--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;