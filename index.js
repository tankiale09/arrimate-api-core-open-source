import Fastify from "fastify";
import fastifyCompress from "@fastify/compress";
import fastifyCookie from "@fastify/cookie";
import fastifyMongoSanitize from "@exortek/fastify-mongo-sanitize";
import fastifyEnv from "@fastify/env";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyHelmet from "@fastify/helmet";
import Redis from "ioredis";
import cors from "@fastify/cors";
import dbConnection from "./plugins/db.js";
import envSchema from "./schemas/envSchema.js";
import userRoutes from "./routes/userRoutes.js";

const environment = process.env.NODE_ENV ?? "development";
const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        colorize: true, // --colorize
        colorizeObjects: true, //--colorizeObjects
      },
    },
  },
  production: false
};

// Instanciar Fastify con soporte para HTTP/2 y TLS
const fastify = Fastify({
  logger: envToLogger[environment] ?? false,
});
await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
})
await fastify.register(fastifyHelmet);
await fastify.register(fastifyRateLimit, {
  max: 20,
  timeWindow: "1 minute",
});
await fastify.register(fastifyEnv, {
  dotenv: true,
  schema: envSchema,
});
await fastify.register(dbConnection);
let redis = new Redis(fastify.config.REDIS);
redis.on("connect",(err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info("Connected to Redis");
})
fastify.decorate("redis", redis);
await fastify.register(fastifyMongoSanitize);
await fastify.register(fastifyCompress, {
  encodings: ["br", "gzip"],
  threshold: 100,
});
await fastify.register(fastifyCookie, {
  parseOptions: {},
  hook: "onRequest",
  secret: fastify.config.SECRET_COOKIES,
});
// Registrar rutas con prefijo
await fastify.register(userRoutes, { prefix: "/api/v1/users" });
fastify.route({
  method: "GET",
  url: "/",
  handler: async(request, reply) => {
    reply.send({ message: "Hello World" });
  },
});
//Esperar Fastify para registrar los plugins
await fastify.ready();
// Iniciar el servidor
const start = async () => {
  try {
    fastify.listen({ 
      port: process.env.PORT ,
      host: '0.0.0.0' 
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
