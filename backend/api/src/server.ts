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

  app.register(require("./routes/account/GET"), { prefix: "account" });
  app.register(require("./routes/account/PUT"), { prefix: "account" });
  app.register(require("./routes/account/POST"), { prefix: "account" });

  app.register(require("./routes/budget/GET"), { prefix: "budget" });
  app.register(require("./routes/budget/PUT"), { prefix: "budget" });
  app.register(require("./routes/budget/expense/total/GET"), { prefix: "budget/expense/total" });

  console.clear();
  app.listen({
    host: app.config.HOST,
    port: app.config.PORT,
  });
}

main();
