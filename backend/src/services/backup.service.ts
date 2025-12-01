import * as csv from "@std/csv";

import { getDbConnection } from "@src/db/connection.ts";
import { BudgetRepo } from "@src/db/repo/budget.repo.ts";
import { BudgetCategoryRepo } from "@src/db/repo/budget-category.repo.ts";
import { TransactionRepo } from "@src/db/repo/transaction.repo.ts";

export function getBudgetsAsCsv() {
  const budgetRepo = new BudgetRepo(getDbConnection());
  const budgets = budgetRepo
    .getAll()
    .map((e) => ({ ...e.data() }))
    .map((e) => ({
      ...e,
      periodStart: e.periodStart.unix(),
      periodEnd: e.periodEnd.unix(),
    }));
  return csv.stringify(budgets, {
    columns: [
      { prop: "id", header: "id" },
      { prop: "periodStart", header: "period_start" },
      { prop: "periodEnd", header: "period_end" },
      { prop: "expectedIncome", header: "expected_income" },
      { prop: "expectedExpense", header: "expected_expense" },
      { prop: "expectedUtilization", header: "expected_utilization" },
      { prop: "expectedSurplus", header: "expected_surplus" },
    ],
  });
}

export function getBudgetCategoriesAsCsv() {
  const budgetCategoryRepo = new BudgetCategoryRepo(getDbConnection());
  const budgetCategories = budgetCategoryRepo
    .getAll()
    .map((e) => ({ ...e.data() }));
  return csv.stringify(budgetCategories, {
    columns: [
      { prop: "id", header: "id" },
      { prop: "budgetId", header: "budget_id" },
      { prop: "name", header: "name" },
      { prop: "type", header: "type" },
      { prop: "rate", header: "rate" },
    ],
  });
}

export function getTransactionsAsCsv() {
  const transactionRepo = new TransactionRepo(getDbConnection());
  const transactions = transactionRepo
    .getAll()
    .map((e) => ({ ...e.data() }))
    .map((e) => ({
      ...e,
      timestamp: e.timestamp.unix(),
    }));
  return csv.stringify(transactions, {
    columns: [
      { prop: "id", header: "id" },
      { prop: "budgetId", header: "budget_id" },
      { prop: "timestamp", header: "timestamp" },
      { prop: "category", header: "category" },
      { prop: "amount", header: "amount" },
      { prop: "note", header: "note" },
    ],
  });
}
