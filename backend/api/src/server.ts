import * as fastify from "fastify";

async function main() {
  const app = fastify.fastify({
    logger: {
      enabled: true,
      level: "info",
    },
  });

  await app.register(require("./config"));
  await app.register(require("./db"));

  app.get("/health", async () => {
    return;
  });

  console.clear();
  app.listen({
    host: app.config.HOST,
    port: app.config.PORT,
  });
}

main();
