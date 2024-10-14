import * as jwt from "jsonwebtoken";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  fastify.addHook("preParsing", async (req, res) => {
    if (!req.isProtected) {
      return;
    }

    var bearerToken = req.headers.authorization;

    if (!bearerToken || !jwt.verify(bearerToken, fastify.config.JWT_SECRET)) {
      res.code(401).send("Unauthenticated");
      return;
    }

    return;
  });
});
