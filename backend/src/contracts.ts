import { z } from "zod";

export const TransactionTypeContract = z.enum([
  "Income",
  "Expense",
  "Utilization",
]);
// deno-fmt-ignore
export type TransactionTypeContract = z.infer<typeof TransactionCategoryContract>;

export const TransactionCategoryContract = z.object({
  id: z.string(),
  budgetId: z.string(),
  name: z.string(),
  type: TransactionTypeContract,
  rate: z.number(),
});
// deno-fmt-ignore
export type TransactionCategoryContract = z.infer<typeof TransactionCategoryContract>;

export const ReplaceTransactionCategoryContract = TransactionCategoryContract
  .partial({
    id: true,
    budgetId: true,
  });
// deno-fmt-ignore
export type ReplaceTransactionCategoryContract = z.infer<typeof ReplaceTransactionCategoryContract>;

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
export type BudgetContract = z.infer<typeof BudgetContract>;

export const UpsertBudgetContract = BudgetContract.partial({
  id: true,
  categories: true,
});
export type UpsertBudgetContract = z.infer<typeof UpsertBudgetContract>;
