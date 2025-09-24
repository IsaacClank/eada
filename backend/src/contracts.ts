import { z } from "zod";

export const TransactionTypeContract = z.enum([
  "Income",
  "Expense",
  "Utilization",
]);
// deno-fmt-ignore
export type TransactionTypeContract = z.infer<typeof BudgetCategoryContract>;

export const BudgetCategoryContract = z.object({
  id: z.string(),
  budgetId: z.string(),
  name: z.string(),
  type: TransactionTypeContract,
  rate: z.number(),
});
// deno-fmt-ignore
export type BudgetCategoryContract = z.infer<typeof BudgetCategoryContract>;

export const ReplaceBudgetCategoryContract = BudgetCategoryContract
  .partial({
    id: true,
    budgetId: true,
  });
// deno-fmt-ignore
export type ReplaceBudgetCategoryContract = z.infer<typeof ReplaceBudgetCategoryContract>;

export const BudgetContract = z.object({
  id: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  expectedIncome: z.number(),
  expectedExpense: z.number(),
  expectedUtilization: z.number(),
  expectedSurplus: z.number(),
  categories: BudgetCategoryContract.array(),
});
export type BudgetContract = z.infer<typeof BudgetContract>;

export const UpsertBudgetContract = BudgetContract.partial({
  id: true,
  categories: true,
});
export type UpsertBudgetContract = z.infer<typeof UpsertBudgetContract>;
