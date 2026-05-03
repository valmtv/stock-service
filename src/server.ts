import 'dotenv/config';
import Fastify from 'fastify';
import cluster from 'node:cluster';
import process from 'node:process';
import { env } from './config.js';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { stocksRoutes } from './modules/stocks/routes.js';
import { walletsRoutes } from './modules/wallets/routes.js';
import { logRoutes } from './modules/log/routes.js';

const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

// Add Zod compiler for validation and serialization
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Register Swagger OpenAPI generation
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Stock Service API',
      description: 'Simplified stock market REST API',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

app.register(stocksRoutes, { prefix: '/stocks' });
app.register(walletsRoutes, { prefix: '/wallets' });
app.register(logRoutes, { prefix: '/log' }); // /log to match the requirements

app.get('/health', () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

app.post('/chaos', () => {
  process.exit(1);
});

const start = async () => {
  try {
    await app.listen({ port: Number(env.PORT), host: '0.0.0.0' });
    app.log.info(`Server listening on http://localhost:${env.PORT}`);
    app.log.info(`Swagger Docs available at http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

if (cluster.isPrimary) {
  for (let i = 0; i < 2; i++) {
    cluster.fork();
  }

  cluster.on('exit', () => {
    cluster.fork();
  });
} else {
  await start();
}
