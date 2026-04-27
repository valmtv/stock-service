# stock-service

Simplified stock market REST API.

## Tech Stack

- **Node.js**
- **Fastify**
- **PostgreSQL**
- **Drizzle ORM**
- **Zod**
- **TypeScript**

> Caching layer (e.g. Redis) was evaluated and deliberately excluded. The data access patterns are simple and DB-level constraints already guarantee consistency without additional infrastructure complexity.

## Requirements

- Node.js >= 20
- Docker + Docker Compose

## Local Development

```bash
cp .env.example .env
npm install
docker compose up db -d
npm run db:generate
npm run db:push
npm run dev
```

Override port:

```bash
PORT=4000 npm run dev
```

Service runs at `http://localhost:3000` by default, or `http://localhost:<PORT>` when `PORT` is set.

## Environment Variables

| Variable       | Default                                           | Description                     |
| -------------- | ------------------------------------------------- | ------------------------------- |
| `DATABASE_URL` | `postgres://user:password@localhost:5432/stockdb` | Full Postgres connection string |
| `PORT`         | `3000`                                            | HTTP server port                |
| `DB_USER`      | `user`                                            | Postgres user                   |
| `DB_PASSWORD`  | `password`                                        | Postgres password               |
| `DB_NAME`      | `stockdb`                                         | Postgres database name          |

## Database Migrations

```bash
npm run db:generate   # generate migration files from schema
npm run db:push       # apply to database
```
