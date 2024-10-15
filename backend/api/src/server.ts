import * as fastify from "fastify";

async function main() {
  const app = fastify.fastify({
    logger: {
      enabled: true,
      level: "info",
    },
  });

  await app.register(require("./fastify"));

  app.get("/health", { onRequest: app.authorize() }, async () => {
    return;
  });

  app.register(require("./routes/account"), { prefix: "account" });

  console.clear();
  app.listen({
    host: app.config.HOST,
    port: app.config.PORT,
  });
}

main();
