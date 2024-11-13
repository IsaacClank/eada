import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { extendBudgetModel } from "./extensions/budget";
import { extendTagModel } from "./extensions/tag";
import { extendTransactionModel } from "./extensions/transaction";

export type ExtendedPrismaClient = ReturnType<typeof initPrisma>;

export default fp(async app => {
  const prisma = initPrisma(app);
  app.decorate("db", prisma);
});

function initPrisma(app: FastifyInstance) {
  const prisma = new PrismaClient();
  return prisma.$extends({
    model: {
      budget: extendBudgetModel(app, prisma),
      tag: extendTagModel(app, prisma),
      transaction: extendTransactionModel(app, prisma),
    },
  });
}
