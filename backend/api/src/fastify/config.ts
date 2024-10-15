import fp from "fastify-plugin";

export default fp(async (fastify) => {
  await fastify.register(require("@fastify/env"), {
    dotenv: true,
    schema: {
      type: "object",
      properties: {
        ENVIRONMENT: { type: "string", default: "development" },
        HOST: { type: "string", default: "::" },
        PORT: { type: "number", default: 3000 },
        DATABSE_URL: { type: "string" },
        JWT_ISSUER: { type: "string" },
        JWT_SECRET: { type: "string" },
      },
    },
  });
});
