import fp from "fastify-plugin";

export default fp(async (fastify) => {
  await fastify.register(require("@fastify/sensible"), {
    sharedSchemaId: "HttpError",
  });
  fastify.decorate("httpErrorSchema", { $id: "HttpError" });

  await fastify.register(require("./config"));
  await fastify.register(require("./jwt"));
  await fastify.register(require("./db"));
  await fastify.register(require("./auth"));
});
