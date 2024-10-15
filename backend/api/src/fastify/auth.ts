import * as fastify from "fastify";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  fastify.addHook("preParsing", async (req, res) => {
    if (!req.protected) {
      return;
    }

    const bearerToken = req.headers.authorization;
    if (
      bearerToken &&
      fastify.jwt.verify(bearerToken, {
        allowedIss: fastify.config.JWT_ISSUER,
      })
    ) {
      return;
    }

    res.unauthorized();
  });

  fastify.decorate("authorize", () => {
    return async (req: fastify.FastifyRequest) => {
      req.protected = true;
      return;
    };
  });
});
