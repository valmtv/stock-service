CREATE TABLE "audit_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" text NOT NULL,
	"wallet_id" text NOT NULL,
	"stock_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_stocks" (
	"stock_name" text PRIMARY KEY NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "bank_quantity_chk" CHECK ("bank_stocks"."quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "wallet_stocks" (
	"wallet_id" text NOT NULL,
	"stock_name" text NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "wallet_stocks_wallet_id_stock_name_pk" PRIMARY KEY("wallet_id","stock_name"),
	CONSTRAINT "wallet_quantity_chk" CHECK ("wallet_stocks"."quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallet_stocks" ADD CONSTRAINT "wallet_stocks_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;