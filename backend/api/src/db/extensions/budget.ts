import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";

export interface BudgetOverview {
  id: string;
  name: string;
  normalizedName: string;
  income: number;
  totalRemainingInMonth: number;
  totalExpenseInMonth: number;
  assetAccumulation: number;
  categories: BudgetCategoryOverview[];
}

export interface BudgetCategoryOverview {
  id: string;
  name: string;
  normalizedName: string;
  percentageOfIncome: number;
  totalExpenseInMonth: number;
  totalRemainingInMonth: number;
}

export function extendBudgetModel(app: FastifyInstance, prisma: PrismaClient) {
  return {
    async getBudgetOverview(userId: string, budgetId: string): Promise<BudgetOverview> {
      const budget = await prisma.budget.findUniqueOrThrow({
        where: { userId, id: budgetId },
        include: {
          budgetCategories: {
            include: {
              tag: true,
            },
          },
        },
      });

      const transactionsInMonth = await prisma.transaction.findMany({
        where: {
          createdAt: { gte: app.dayjs().startOf("month").toDate() },
        },
        include: {
          tagToTransaction: { include: { tag: true } },
        },
      });

      const totalExpenseInMonth = transactionsInMonth
        .filter(t => t.type === "Expense")
        .reduce((sum, { amount }) => sum + amount.toNumber(), 0);
      const totalRemainingInMonth = budget.income.toNumber() - totalExpenseInMonth;

      const actualIncome = transactionsInMonth
        .filter(({ type }) => type === "Income")
        .reduce((sum, { amount }) => sum + amount.toNumber(), 0);
      const assetAccumulation = actualIncome - totalExpenseInMonth;

      const budgetCategoryIdToOverviewInfo = budget.budgetCategories.reduce(
        (
          idToCategoryOverview,
          { id, percentageOfIncome, tagId: categoryTagId, tag: { name, normalizedName } },
        ) => {
          const totalBudget = (budget.income.toNumber() * percentageOfIncome.toNumber()) / 100;

          const transactions = transactionsInMonth.filter(transaction =>
            transaction.tagToTransaction.map(t => t.tagId).includes(categoryTagId),
          );
          const totalExpenseInMonth = transactions.reduce(
            (sum, { amount }) => sum + amount.toNumber(),
            0,
          );

          return idToCategoryOverview.set(id, {
            id,
            name,
            normalizedName,
            percentageOfIncome: percentageOfIncome.toNumber(),
            totalExpenseInMonth,
            totalRemainingInMonth: totalBudget - totalExpenseInMonth,
          });
        },
        new Map<string, BudgetCategoryOverview>(),
      );

      return {
        id: budget.id,
        income: budget.income.toNumber(),
        name: budget.name,
        normalizedName: budget.normalizedName,
        totalExpenseInMonth,
        totalRemainingInMonth,
        assetAccumulation,
        categories: budget.budgetCategories.map(
          ({ id }) => budgetCategoryIdToOverviewInfo.get(id)!,
        ),
      };
    },
  };
}
