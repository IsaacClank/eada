import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  fastify.decorate("db", new PrismaClient());
});
