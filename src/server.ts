import 'dotenv/config';
import Fastify from 'fastify';
import { env } from './config.js';

const app = Fastify({ logger: true });

app.get('/', async () => {
  return { status: 'ok' };
});

app.listen({
  port: Number(env.PORT),
  host: '0.0.0.0',
});
