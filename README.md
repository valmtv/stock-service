# stock-service

Simplified stock market REST API built with Fastify, PostgreSQL, and Drizzle ORM.

## Quick Start

**Linux / macOS:**

```bash
cp .env.example .env
npm install
./start.sh <PORT>
```

**Windows:**

```bat
copy .env.example .env
npm install
start.bat <PORT>
```

Both scripts spin up the Postgres container, push the schema, and start the server. The service will be available at `http://localhost:<PORT>`.

## Requirements

- Node.js >= 20
- Docker + Docker Compose

## Development

```bash
cp .env.example .env
npm install
docker compose up db -d
npm run db:push
npm run dev               # default port 3000
PORT=4000 npm run dev     # custom port
```

## Environment Variables

| Variable       | Default                                           | Description             |
| -------------- | ------------------------------------------------- | ----------------------- |
| `DATABASE_URL` | `postgres://user:password@localhost:5432/stockdb` | Postgres connection URL |
| `PORT`         | `3000`                                            | HTTP server port        |
| `DB_USER`      | `user`                                            | Postgres user           |
| `DB_PASSWORD`  | `password`                                        | Postgres password       |
| `DB_NAME`      | `stockdb`                                         | Postgres database name  |

## API Overview

| Method | Path                                     | Description                               |
| ------ | ---------------------------------------- | ----------------------------------------- |
| GET    | `/stocks`                                | Current bank state                        |
| POST   | `/stocks`                                | Set bank state (full overwrite)           |
| GET    | `/wallets/:wallet_id`                    | Wallet contents                           |
| GET    | `/wallets/:wallet_id/stocks/:stock_name` | Single stock quantity in wallet           |
| POST   | `/wallets/:wallet_id/stocks/:stock_name` | Buy or sell one unit of a stock           |
| POST   | `/wallets`                               | Reset wallets (clears stocks + audit log) |
| GET    | `/log`                                   | Full audit log (successful ops only)      |
| POST   | `/chaos`                                 | Kills the serving instance                |
| GET    | `/health`                                | Health check                              |
| GET    | `/docs`                                  | Swagger UI                                |

Buy/sell body: `{ "type": "buy" | "sell" }`.  
Stock price is always 1 (fixed). No wallet balance is tracked.

## High Availability

The server uses Node.js `cluster` to spawn **2 worker processes** sharing the same port. When a worker is killed (e.g. via `POST /chaos`), the primary process automatically forks a replacement. Killing one instance does not take the service down.

## Tech Stack

- **Fastify 5** + **Zod** (validation & OpenAPI schema generation)
- **Drizzle ORM** on **PostgreSQL 15** (transactions with DB-level `CHECK` constraints for quantity ≥ 0)
- **TypeScript 6**, ESLint, Prettier, Husky pre-commit hooks

## Database Migrations

```bash
npm run db:generate   # generate migration files from schema changes
npm run db:push       # apply to the running database
```
