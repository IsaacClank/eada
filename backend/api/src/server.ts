import { fastifyEnv, FastifyEnvOptions } from "@fastify/env";

import * as fastify from "fastify";

async function main() {
  const app = fastify.fastify({
    logger: {
      enabled: true,
      level: "info",
    },
  });

  await app.register(fastifyEnv, {
    dotenv: true,
    schema: {
      properties: {
        ENVIRONMENT: { type: "string", default: "development" },
        HOST: { type: "string", default: "::" },
        PORT: { type: "number", default: 3000 },
        DATABSE_URL: { type: "string" },
      },
    },
  } as FastifyEnvOptions);

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
