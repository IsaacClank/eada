import { beforeAll, describe, it } from "@std/testing/bdd";
import { SpyLike, stub } from "@std/testing/mock";
import { assertArrayIncludes, assertEquals } from "@std/assert";
import * as csv from "@std/csv";

import { Chrono } from "@src/lib/chrono.ts";
import { getDbConnection } from "@src/db/connection.ts";
import {
  BudgetCategoryData,
  BudgetData,
  TransactionData,
} from "@src/models/index.ts";
import {
  BudgetCategoryDbRecord,
  BudgetCategoryRepo,
  BudgetDbRecord,
  BudgetRepo,
  TransactionDbRecord,
  TransactionRepo,
} from "@src/db/repo/index.ts";

import * as backupService from "./backup.service.ts";

type BudgetRepoStub = { getAll?: SpyLike };
type BudgetCategoryRepoStub = { getAll?: SpyLike };
type TransactionRepoStub = { getAll?: SpyLike };

describe("budget.service", () => {
  const budgetRepoStub: BudgetRepoStub = {};
  const budgetCategoryRepoStub: BudgetCategoryRepoStub = {};
  const transactionRepoStub: TransactionRepoStub = {};

  beforeAll(() => {
    stub(getDbConnection(), "function", () => ({}));
  });

  describe("getBudgetsAsCsv()", () => {
    it("should return budgets records as CSV", () => {
      const expectedBudgets: BudgetData[] = [{
        id: crypto.randomUUID(),
        periodStart: Chrono.from("2025-01-01"),
        periodEnd: Chrono.from("2025-02-01"),
        expectedIncome: 100,
        expectedExpense: 50,
        expectedUtilization: 35,
        expectedSurplus: 15,
      }];

      budgetRepoStub.getAll?.restore();
      budgetRepoStub.getAll = stub(
        BudgetRepo.prototype,
        "getAll",
        () =>
          expectedBudgets.map((e) =>
            new BudgetDbRecord({
              id: e.id,
              period_start: e.periodStart.unix(),
              period_end: e.periodEnd.unix(),
              expected_income: e.expectedIncome,
              expected_expense: e.expectedExpense,
              expected_utilization: e.expectedUtilization,
              expected_surplus: e.expectedSurplus,
            })
          ),
      );

      const actual = csv.parse(backupService.getBudgetsAsCsv(), {
        skipFirstRow: true,
      });
      assertEquals(1, actual.length);
      assertArrayIncludes(
        actual,
        expectedBudgets.map((e) => ({
          id: e.id,
          period_start: e.periodStart.unix().toString(),
          period_end: e.periodEnd.unix().toString(),
          expected_income: `${e.expectedIncome}`,
          expected_expense: `${e.expectedExpense}`,
          expected_utilization: `${e.expectedUtilization}`,
          expected_surplus: `${e.expectedSurplus}`,
        })),
      );
    });
  });

  describe("getBudgetCategoriesAsCsv()", () => {
    it("should return budget categories records as CSV", () => {
      const expectedBudgetId = crypto.randomUUID();
      const expectedBudgetCategories: BudgetCategoryData[] = [
        {
          id: crypto.randomUUID(),
          budgetId: expectedBudgetId,
          name: "Salary",
          type: "Income",
          rate: 1,
        },
        {
          id: crypto.randomUUID(),
          budgetId: expectedBudgetId,
          name: "Essential",
          type: "Expense",
          rate: 0.5,
        },
        {
          id: crypto.randomUUID(),
          budgetId: expectedBudgetId,
          name: "Investment",
          type: "Utilization",
          rate: 0.5,
        },
      ];

      budgetCategoryRepoStub?.getAll?.restore();
      budgetCategoryRepoStub.getAll = stub(
        BudgetCategoryRepo.prototype,
        "getAll",
        () =>
          expectedBudgetCategories.map((e) =>
            new BudgetCategoryDbRecord({
              id: e.id,
              budget_id: e.budgetId,
              name: e.name,
              type: e.type,
              rate: e.rate,
            })
          ),
      );

      const actual = csv.parse(backupService.getBudgetCategoriesAsCsv(), {
        skipFirstRow: true,
      });
      assertEquals(actual.length, expectedBudgetCategories.length);
      assertArrayIncludes(
        actual,
        expectedBudgetCategories.map((e) => ({
          id: e.id,
          budget_id: e.budgetId,
          name: e.name,
          type: e.type,
          rate: e.rate.toString(),
        })),
      );
    });
  });

  describe("getTransactionsAsCsv()", () => {
    it("should return all transaction records as CSV", () => {
      const budgetId = crypto.randomUUID();
      const expectedTransactions: TransactionData[] = [
        {
          id: crypto.randomUUID(),
          budgetId: budgetId,
          timestamp: Chrono.from("2025-01-02"),
          amount: 125000,
          category: "Essential",
          note: "",
        },
      ];

      transactionRepoStub.getAll?.restore();
      transactionRepoStub.getAll = stub(
        TransactionRepo.prototype,
        "getAll",
        () =>
          expectedTransactions.map((e) =>
            new TransactionDbRecord({
              id: e.id,
              budget_id: e.budgetId,
              timestamp: e.timestamp.unix(),
              category: e.category,
              amount: e.amount,
              note: e.note,
            })
          ),
      );

      const actual = csv.parse(backupService.getTransactionsAsCsv(), {
        skipFirstRow: true,
      });
      assertEquals(actual.length, expectedTransactions.length);
      assertArrayIncludes(
        actual,
        expectedTransactions.map((e) => ({
          id: e.id,
          budget_id: e.budgetId,
          timestamp: e.timestamp.unix().toString(),
          category: e.category,
          amount: e.amount.toString(),
          note: e.note,
        })),
      );
    });
  });
});
