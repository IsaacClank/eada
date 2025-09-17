import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { applyDbMigrations } from "../migration.ts";
import { Config } from "../../config.ts";
import { TransactionCategory } from "./transaction-category.ts";
import { Chrono } from "../../lib/chrono.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertIsError,
  assertThrows,
} from "@std/assert";
import { Budget } from "./budget.ts";
import { ForeignKeyConstraintException } from "../common.ts";

describe("TransactionCategory", () => {
  let expectedBudget!: Budget;

  beforeEach(async () => {
    await applyDbMigrations();
    expectedBudget = Budget.upsert({
      id: crypto.randomUUID(),
      periodStart: Chrono.from("2025-01-01"),
      periodEnd: Chrono.from("2025-02-01"),
      expectedIncome: 100,
      expectedExpense: 60,
      expectedUtilization: 30,
      expectedSurplus: 10,
    })[0];
  });

  afterEach(async () => {
    const rawDbPath = Deno.env.get(Config.DbPath)!;
    const parsedDbPath = rawDbPath.replaceAll("~", Deno.env.get("HOME")!);
    await Deno.remove(parsedDbPath);
  });

  describe("upsert", () => {
    it("should work", () => {
      const expectedCategories: TransactionCategory[] = [
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Salary",
          type: "Income",
          rate: 1,
        }),
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Essential",
          type: "Expense",
          rate: 0.5,
        }),
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Non-Essential",
          type: "Expense",
          rate: 0.3,
        }),
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Saving",
          type: "Utilization",
          rate: 0.1,
        }),
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Investment",
          type: "Utilization",
          rate: 0.1,
        }),
      ];
      const actualCategories = TransactionCategory.upsert(
        ...expectedCategories,
      );

      assertEquals(actualCategories.length, expectedCategories.length);
      assert(actualCategories.every((e) => e.budgetId === expectedBudget.id));
      assertArrayIncludes(actualCategories, expectedCategories);
    });

    describe("when the specified budget is non-existent", () => {
      it("should throw", () => {
        const expectedCategories: TransactionCategory[] = [
          TransactionCategory.from({
            id: crypto.randomUUID(),
            budgetId: crypto.randomUUID(),
            name: "Salary",
            type: "Income",
            rate: 1,
          }),
        ];

        const actual = assertThrows(() =>
          TransactionCategory.upsert(...expectedCategories)
        );

        assertIsError(actual, ForeignKeyConstraintException);
      });
    });
  });

  describe("getByIds", () => {
    describe("when no argument is provided", () => {
      it("should return an empty array", () => {
        assertEquals(TransactionCategory.getByIds().length, 0);
      });
    });

    describe("when argments are provided", () => {
      it("should return records with matching ids", () => {
        const expectedCategories: TransactionCategory[] = [
          TransactionCategory.from({
            id: crypto.randomUUID(),
            budgetId: expectedBudget.id,
            name: "Salary",
            type: "Income",
            rate: 1,
          }),
          TransactionCategory.from({
            id: crypto.randomUUID(),
            budgetId: expectedBudget.id,
            name: "Essential",
            type: "Expense",
            rate: 0.5,
          }),
          TransactionCategory.from({
            id: crypto.randomUUID(),
            budgetId: expectedBudget.id,
            name: "Investment",
            type: "Utilization",
            rate: 0.5,
          }),
        ];
        TransactionCategory.upsert(...expectedCategories);
        assertArrayIncludes(
          TransactionCategory.getByIds(...expectedCategories.map((c) => c.id)),
          expectedCategories,
        );
      });
    });
  });

  describe("getByBudgetId", () => {
    it("should search and return records based on budget ID", () => {
      const expectedCategories: TransactionCategory[] = [
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Salary",
          type: "Income",
          rate: 1,
        }),
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Essential",
          type: "Expense",
          rate: 0.5,
        }),
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Investment",
          type: "Utilization",
          rate: 0.5,
        }),
      ];
      TransactionCategory.upsert(...expectedCategories);
      assertArrayIncludes(
        TransactionCategory.getByBudgetId(expectedBudget.id),
        expectedCategories,
      );
    });
  });

  describe("deleteByBudgetId", () => {
    it("should deletes transaction categories belonging to the specified budget", () => {
      const expectedCategories: TransactionCategory[] = [
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Salary",
          type: "Income",
          rate: 1,
        }),
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Essential",
          type: "Expense",
          rate: 0.5,
        }),
        TransactionCategory.from({
          id: crypto.randomUUID(),
          budgetId: expectedBudget.id,
          name: "Investment",
          type: "Utilization",
          rate: 0.5,
        }),
      ];
      TransactionCategory.upsert(...expectedCategories);
      TransactionCategory.deleteByBudgetId(expectedBudget.id);
      assertEquals(
        TransactionCategory
          .getByIds(...expectedCategories.map((e) => e.id))
          .length,
        0,
      );
    });
  });
});
