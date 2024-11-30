import * as fastify from "fastify";

async function start() {
  const app = fastify.fastify({
    logger: {
      enabled: true,
      level: "info",
      transport: {
        target: "pino-pretty",
      },
    },
  });

  await app.register(require("./config"));
  await app.register(require("@fastify/sensible"));
  await app.register(require("@fastify/cors"), {
    origin: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  });
  await app.register(require("@fastify/multipart"));
  await app.register(require("./auth"));
  await app.register(require("./dayjs"));
  await app.register(require("./db"));
  await app.register(require("./routes"));

  console.clear();
  app.listen({
    host: app.config.HOST,
    port: app.config.PORT,
  });
}

start();
