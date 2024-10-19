import fp from "fastify-plugin";

export default fp(async (fastify) => {
  await fastify.register(require("@fastify/sensible"), {
    sharedSchemaId: "HttpError",
  });
  fastify.decorate("httpErrorSchema", { $id: "HttpError" });

  await fastify.register(require("@fastify/cors"), {
    origin: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await fastify.register(require("./config"));
  await fastify.register(require("./auth"));
  await fastify.register(require("./db"));
});
