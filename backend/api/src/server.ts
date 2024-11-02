import * as fastify from "fastify";

async function main() {
  const app = fastify.fastify({
    logger: {
      enabled: true,
      level: "info",
      transport: {
        target: "pino-pretty",
      },
    },
  });

  await app.register(require("./fastify"));

  app.get("/health", { onRequest: app.authorize() }, async () => {
    return;
  });

  app.register(require("./routes/account"), { prefix: "account" });
  app.register(require("./routes/budget"), { prefix: "budget" });

  console.clear();
  app.listen({
    host: app.config.HOST,
    port: app.config.PORT,
  });
}

main();
