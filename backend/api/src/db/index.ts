import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "eada/lib/error";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

export type ExtendedPrismaClient = ReturnType<typeof initPrisma>;

export default fp(async app => {
  const prisma = initPrisma(app);
  app.decorate("db", prisma);
});

function initPrisma(app: FastifyInstance) {
  const prisma = new PrismaClient();
  return prisma.$extends({
    model: {
      budget: budgetExtension(app, prisma),
    },
  });
}

function budgetExtension(app: FastifyInstance, prisma: PrismaClient) {
  return {
    async totalExpenseInMonth(userId: string): Promise<number> {
      const startOfMonth = app.dayjs().startOf("month");
      const transactionInMonthAggregation = await prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId,
          createdAt: {
            gte: startOfMonth.toDate(),
            lt: startOfMonth.add(1, "month").toDate(),
          },
        },
      });
      return transactionInMonthAggregation._sum.amount?.toNumber() ?? 0;
    },

    async totalRemainingBudgetInMonth(userId: string) {
      const startOfMonth = app.dayjs().startOf("month");
      app.log.info(`Retrieving total remaining budget in ${startOfMonth.format("MMM, YYYY")}`);
      const user = await app.db.user.findUnique({
        select: {
          budget: {
            take: 1,
            select: {
              income: true,
            },
          },
          transaction: {
            where: {
              createdAt: {
                gte: startOfMonth.toDate(),
                lt: startOfMonth.add(1, "month").toDate(),
              },
            },
          },
        },
        where: {
          id: userId,
        },
      });

      if (user == null) {
        throw new NotFoundError("User not found");
      }

      if (user.budget.length === 0) {
        throw new NotFoundError("User does not have any budget");
      }

      const totalBudget = user.budget[0].income.toNumber();
      const totalExpenseInMonth =
        user.transaction.reduce((total, { amount }) => total + amount.toNumber(), 0) ?? 0;
      return totalBudget - totalExpenseInMonth;
    },
  };
}
