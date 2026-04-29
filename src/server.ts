import 'dotenv/config';
import Fastify from 'fastify';
import { env } from './config.js';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import { stockRoutes } from './modules/stocks/routes.js';

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
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

app.register(stockRoutes, { prefix: '/stocks' });

app.get('/health', () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    await app.listen({ port: Number(env.PORT), host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${env.PORT}`);
    console.log(`Swagger Docs available at http://localhost:${env.PORT}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

await start();
