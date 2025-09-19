import { z } from "zod";

export const TransactionCategoryContract = z.object({
  id: z.string(),
  budgetId: z.string(),
  name: z.string(),
  type: z.string(),
  rate: z.number(),
});

export const ReplaceTransactionCategoryContract = TransactionCategoryContract
  .partial({
    id: true,
    budgetId: true,
  });

export const BudgetContract = z.object({
  id: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  expectedIncome: z.number(),
  expectedExpense: z.number(),
  expectedUtilization: z.number(),
  expectedSurplus: z.number(),
  categories: TransactionCategoryContract
    .partial({ id: true, budgetId: true })
    .array(),
});

export const UpsertBudgetContract = BudgetContract.partial({
  id: true,
  categories: true,
});

export type BudgetContract = z.infer<typeof BudgetContract>;
export type UpsertBudgetContract = z.infer<typeof UpsertBudgetContract>;
export type TransactionCategoryContract = z.infer<
  typeof TransactionCategoryContract
>;
export type ReplaceTransactionCategoryContract = z.infer<
  typeof ReplaceTransactionCategoryContract
>;
