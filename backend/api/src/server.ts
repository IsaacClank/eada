import Fastify from "fastify";

const fastify = Fastify({
  logger: {
    enabled: true,
    level: "info",
  },
});

fastify.get("/ping", () => "pong");

console.clear();
fastify.listen({ host: "::", port: 3000 });
