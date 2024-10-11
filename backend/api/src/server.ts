import * as fastifyEnv from "@fastify/env";
import * as fastify from "fastify";

async function main() {
  const fastifyInstance = fastify.fastify({
    logger: {
      enabled: true,
      level: "info",
    },
  });

  await fastifyInstance.register(fastifyEnv.fastifyEnv, {
    dotenv: true,
    schema: {
      properties: {
        ENVIRONMENT: { type: "string", default: "development" },
        HOST: { type: "string", default: "::" },
        PORT: { type: "number", default: 3000 },
      },
    },
  } as fastifyEnv.FastifyEnvOptions);

  fastifyInstance.get("/ping", () => "pong");

  console.clear();
  await fastifyInstance.listen({
    host: fastifyInstance.config.HOST,
    port: fastifyInstance.config.PORT,
  });
}

main();
