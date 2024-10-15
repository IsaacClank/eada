import fp from "fastify-plugin";

export default fp(async (fastify) => {
  await fastify.register(require("@fastify/jwt"), {
    secret: fastify.config.JWT_SECRET,
  });
});
