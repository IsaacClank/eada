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

export const TransactionContract = z.object({
  id: z.uuid(),
  timestamp: z.union([
    z.iso.date(),
    z.iso.datetime({ offset: true, local: true }),
  ]),
  budgetId: z.uuid(),
  category: z.string(),
  amount: z.number(),
  note: z.string(),
});
export type TransactionContract = z.infer<typeof TransactionContract>;

export const CreateTransactionContract = TransactionContract.partial({
  id: true,
  budgetId: true,
  note: true,
});
// deno-fmt-ignore
export type CreateTransactionContract = z.infer<typeof CreateTransactionContract>;
