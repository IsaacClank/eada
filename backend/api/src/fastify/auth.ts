import { FastifyJWTOptions } from "@fastify/jwt";
import * as fastify from "fastify";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  await fastify.register(require("@fastify/jwt"), {
    secret: fastify.config.JWT_SECRET,
    sign: {
      iss: fastify.config.JWT_ISSUER,
      expiresIn: fastify.config.JWT_DURATION,
    },
    verify: {
      allowedIss: [fastify.config.JWT_ISSUER],
    },
  } as FastifyJWTOptions);

  fastify.decorate("authorize", () => {
    return async (req: fastify.FastifyRequest) => {
      await req.jwtVerify();
    };
  });
});
