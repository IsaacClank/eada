import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { applyDbMigrations } from "../migration.ts";
import { Chrono } from "../../lib/chrono.ts";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertIsError,
  assertThrows,
} from "@std/assert";
import { BudgetRepo } from "./budget.repo.ts";
import { BudgetCategoryRepo } from "./budget-category.repo.ts";
import { BudgetData } from "../../models/budget.model.ts";
import { getDbConnection } from "../connection.ts";
import { cleanUpDbAsync, ForeignKeyConstraintException } from "../common.ts";
import { BudgetCategoryData } from "../../models/budget-category.model.ts";

describe("TransactionCategory", () => {
  let budgetRepo!: BudgetRepo;
  let budgetCategoryRepo!: BudgetCategoryRepo;

  const budget: BudgetData = {
    id: crypto.randomUUID(),
    periodStart: Chrono.from("2025-01-01"),
    periodEnd: Chrono.from("2025-02-01"),
    expectedIncome: 100,
    expectedExpense: 60,
    expectedUtilization: 30,
    expectedSurplus: 10,
  };

  beforeEach(async () => {
    await applyDbMigrations();

    budgetRepo = new BudgetRepo(getDbConnection());
    budgetCategoryRepo = new BudgetCategoryRepo(getDbConnection());

    budgetRepo.upsert(budget);
  });

  afterEach(async () => {
    await cleanUpDbAsync();
  });

  describe("upsert", () => {
    it("should work", () => {
      const expectedCategories: BudgetCategoryData[] = [
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Salary",
          type: "Income",
          rate: 1,
        },
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Essential",
          type: "Expense",
          rate: 0.5,
        },
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Non-Essential",
          type: "Expense",
          rate: 0.3,
        },
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Saving",
          type: "Utilization",
          rate: 0.1,
        },
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Investment",
          type: "Utilization",
          rate: 0.1,
        },
      ];
      const actual = budgetCategoryRepo.upsertMany(
        ...expectedCategories,
      );

      assertEquals(actual, expectedCategories.length);
    });

    describe("when the specified budget is non-existent", () => {
      it("should throw", () => {
        const expectedCategories: BudgetCategoryData[] = [
          {
            id: crypto.randomUUID(),
            budgetId: crypto.randomUUID(),
            name: "Salary",
            type: "Income",
            rate: 1,
          },
        ];

        const actual = assertThrows(() =>
          budgetCategoryRepo.upsertMany(...expectedCategories)
        );

        assertIsError(actual, ForeignKeyConstraintException);
      });
    });
  });

  describe("getByBudgetId", () => {
    it("should search and return records based on budget ID", () => {
      const expectedCategories: BudgetCategoryData[] = [
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Salary",
          type: "Income",
          rate: 1,
        },
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Essential",
          type: "Expense",
          rate: 0.5,
        },
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Investment",
          type: "Utilization",
          rate: 0.5,
        },
      ];
      budgetCategoryRepo.upsertMany(...expectedCategories);
      const actual = budgetCategoryRepo.getByBudgetId(budget.id);
      assert(
        actual.every((a) => expectedCategories.some((b) => a.equal(b))),
      );
    });
  });

  describe("deleteByBudgetId", () => {
    it("should deletes transaction categories belonging to the specified budget", () => {
      const expectedCategories: BudgetCategoryData[] = [
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Salary",
          type: "Income",
          rate: 1,
        },
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Essential",
          type: "Expense",
          rate: 0.5,
        },
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Investment",
          type: "Utilization",
          rate: 0.5,
        },
      ];
      budgetCategoryRepo.upsertMany(...expectedCategories);
      budgetCategoryRepo.deleteByBudgetId(budget.id);
      assertEquals(budgetCategoryRepo.getByBudgetId(budget.id).length, 0);
    });
  });

  describe("getAll", () => {
    it("should return all records", () => {
      const expectedCategories: BudgetCategoryData[] = [
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Salary",
          type: "Income",
          rate: 1,
        },
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Essential",
          type: "Expense",
          rate: 0.5,
        },
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          name: "Investment",
          type: "Utilization",
          rate: 0.5,
        },
      ];
      budgetCategoryRepo.upsertMany(...expectedCategories);

      const actual = budgetCategoryRepo.getAll();
      assertEquals(actual.length, expectedCategories.length);
      assertArrayIncludes(
        actual.map((e) => e.id),
        expectedCategories.map((e) => e.id),
      );
    });
  });
});
