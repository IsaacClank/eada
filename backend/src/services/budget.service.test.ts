import {
  assertEquals,
  assertIsError,
  assertNotEquals,
  assertThrows,
} from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import {
  assertSpyCallArgs,
  assertSpyCalls,
  spy,
  SpyLike,
  stub,
} from "@std/testing/mock";
import {
  BudgetResult,
  getBudgetAsOf,
  replaceTransactionCategories,
  UpsertBudget,
  upsertBudget,
} from "./budget.service.ts";
import { Chrono } from "../lib/chrono.ts";
import { Status } from "@oak/common/status";
import { HttpException } from "../lib/exception.ts";
import { Budget } from "../db/models/budget.ts";
import { TransactionCategory } from "../db/models/transaction-category.ts";
import { ForeignKeyConstraintException } from "../db/common.ts";

type BudgetStub = {
  upsert?: SpyLike;
  getActiveAsOf?: SpyLike;
  getByIds?: SpyLike;
};

type TransactionCategoryStub = {
  getByBudgetId?: SpyLike;
  deleteByBudgetId?: SpyLike;
  upsert?: SpyLike;
};

describe("budget.service", () => {
  describe("upsertBudget", () => {
    const budgetStub: BudgetStub = {};
    const transactionCategoryStub: TransactionCategoryStub = {};

    beforeEach(() => {
      budgetStub.upsert = stub(Budget, "upsert", (...data) => data);
      transactionCategoryStub.getByBudgetId = stub(
        TransactionCategory,
        "getByBudgetId",
        (_) => [],
      );
    });

    afterEach(() => {
      budgetStub.upsert?.restore();
      transactionCategoryStub.getByBudgetId?.restore();
    });

    describe("when expected_expense + expected_utilization + expected_suplus != expected_income", () => {
      it("should throw", () => {
        const actualError = assertThrows(
          () =>
            upsertBudget({
              periodStart: "2025-01-01",
              periodEnd: "2025-02-01",
              expectedIncome: 100,
              expectedExpense: 60,
              expectedUtilization: 30,
              expectedSurplus: 20,
            }),
        );
        assertIsError(actualError, HttpException<Status.Conflict>);
      });
    });

    describe("when an id is specified", () => {
      const budgetData: UpsertBudget = {
        id: crypto.randomUUID(),
        periodStart: "2025-01-01T07:00:00+0700",
        periodEnd: "2025-02-01T07:00:00+0700",
        expectedIncome: 100,
        expectedExpense: 50,
        expectedUtilization: 30,
        expectedSurplus: 20,
      };
      let actualBudget: BudgetResult;

      beforeEach(() => {
        actualBudget = upsertBudget(budgetData);
      });

      it("should call Budget.upsert with the specified budget ID", () => {
        assertSpyCalls(budgetStub.upsert!, 1);
        assertEquals(actualBudget.id, budgetData.id);
        assertSpyCalls(transactionCategoryStub.getByBudgetId!, 1);
      });

      it("should call TransactionCategory.getByBudgetId with the specified budget ID", () => {
        assertSpyCalls(transactionCategoryStub.getByBudgetId!, 1);
        assertSpyCallArgs(transactionCategoryStub.getByBudgetId!, 0, [
          budgetData.id,
        ]);
      });
    });

    describe("when an id is not specified", () => {
      const budgetData: UpsertBudget = {
        periodStart: "2025-01-01T07:00:00+0700",
        periodEnd: "2025-02-01T07:00:00+0700",
        expectedIncome: 100,
        expectedExpense: 50,
        expectedUtilization: 30,
        expectedSurplus: 20,
      };
      let actualBudget: BudgetResult;

      beforeEach(() => {
        actualBudget = upsertBudget(budgetData);
      });

      it("should call Budget.upsert with a generated id", () => {
        assertSpyCalls(budgetStub.upsert!, 1);
        assertNotEquals(actualBudget.id, "");
      });

      it("should call TransactionCategory.getByBudgetId with the specified budget ID", () => {
        assertSpyCalls(transactionCategoryStub.getByBudgetId!, 1);
        assertSpyCallArgs(transactionCategoryStub.getByBudgetId!, 0, [
          actualBudget.id,
        ]);
      });
    });
  });

  describe("getBudgetAsOf", () => {
    const budgetStub: BudgetStub = {};
    const transactionCategoryStub: TransactionCategoryStub = {};

    beforeEach(() => {
      budgetStub.getActiveAsOf?.restore();
      budgetStub.getActiveAsOf = stub(Budget, "getActiveAsOf", (_) => []);
    });

    it("should call Budget.getActiveAsOf", () => {
      const asOf = Chrono.from("2025-01-15");
      assertThrows(() => getBudgetAsOf(asOf));
      assertSpyCallArgs(budgetStub.getActiveAsOf!, 0, [asOf]);
    });

    describe("when budget does not exists", () => {
      it("should throw", () => {
        const error = assertThrows(() =>
          getBudgetAsOf(Chrono.from("2025-01-15"))
        );
        assertIsError(error, HttpException<Status.NotFound>);
      });
    });

    describe("when budget exists", () => {
      const existingBudget: Budget = {
        id: crypto.randomUUID(),
        periodStart: Chrono.from("2025-01-01"),
        periodEnd: Chrono.from("2025-02-01"),
        expectedIncome: 100,
        expectedExpense: 60,
        expectedUtilization: 30,
        expectedSurplus: 10,
      };
      let actual: BudgetResult;

      beforeEach(() => {
        budgetStub.getActiveAsOf?.restore();
        budgetStub.getActiveAsOf = stub(
          Budget,
          "getActiveAsOf",
          (_) => [existingBudget],
        );

        transactionCategoryStub.getByBudgetId?.restore();
        transactionCategoryStub.getByBudgetId = stub(
          TransactionCategory,
          "getByBudgetId",
          (_) => [],
        );

        actual = getBudgetAsOf(Chrono.from("2025-01-15"));
      });

      it("should call TransactionCategory.getByBudgetId", () => {
        assertSpyCallArgs(
          transactionCategoryStub.getByBudgetId!,
          0,
          [existingBudget.id],
        );
        assertSpyCalls(transactionCategoryStub.getByBudgetId!, 1);
      });

      it("should return budget", () => {
        assertEquals(actual.id, existingBudget.id);
      });
    });
  });

  describe("replaceTransactionCategories", () => {
    const budgetStub: BudgetStub = {};
    const transactionCategoryStub: TransactionCategoryStub = {};

    const expectedBudget = Budget.from({
      id: crypto.randomUUID(),
      periodStart: Chrono.from("2025-01-01"),
      periodEnd: Chrono.from("2025-01-01"),
      expectedIncome: 100,
      expectedExpense: 50,
      expectedUtilization: 30,
      expectedSurplus: 20,
    });
    const expectedTransactionCategories = [
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
        name: "All expense",
        type: "Expense",
        rate: 1,
      }),
      TransactionCategory.from({
        id: crypto.randomUUID(),
        budgetId: expectedBudget.id,
        name: "Investment & Saving",
        type: "Utilization",
        rate: 1,
      }),
    ];

    beforeEach(() => {
      budgetStub.getByIds?.restore();
      budgetStub.getByIds = stub(
        Budget,
        "getByIds",
        (..._) => [expectedBudget],
      );

      transactionCategoryStub.deleteByBudgetId?.restore();
      transactionCategoryStub.deleteByBudgetId = stub(
        TransactionCategory,
        "deleteByBudgetId",
        (_) => {},
      );

      transactionCategoryStub.upsert?.restore();
      transactionCategoryStub.upsert = stub(
        TransactionCategory,
        "upsert",
        (...data) => {
          return data;
        },
      );
    });

    it("should call TransactionCategory.deleteByBudgetId", () => {
      replaceTransactionCategories(expectedBudget.id, []);
      assertSpyCallArgs(transactionCategoryStub.deleteByBudgetId!, 0, [
        expectedBudget.id,
      ]);
    });

    describe("when no categories are specified", () => {
      it("should not call TransactionCategory.upsert", () => {
        replaceTransactionCategories(expectedBudget.id, []);
        assertSpyCalls(transactionCategoryStub.upsert!, 0);
      });
    });

    it("should call TransactionCategory.upsert", () => {
      replaceTransactionCategories(
        expectedBudget.id,
        expectedTransactionCategories,
      );
      assertSpyCalls(transactionCategoryStub.upsert!, 1);
    });

    describe("when using a non-existent budget ID", () => {
      beforeEach(() => {
        transactionCategoryStub.deleteByBudgetId?.restore();
        transactionCategoryStub.deleteByBudgetId = stub(
          TransactionCategory,
          "deleteByBudgetId",
          (_) => {
            throw new ForeignKeyConstraintException();
          },
        );
      });

      it("should handle exception thrown by TransactionCategory.upsert", () => {
        const actual = assertThrows(() =>
          replaceTransactionCategories(expectedBudget.id, [])
        );
        assertIsError(actual, HttpException<Status.Conflict>);
      });
    });

    it("should call Budget.getByIds", () => {
      replaceTransactionCategories(expectedBudget.id, []);
      assertSpyCallArgs(budgetStub.getByIds!, 0, [expectedBudget.id]);
    });

    it("should return updated budget data", () => {
      const expected: BudgetResult = {
        ...expectedBudget,
        periodStart: expectedBudget.periodStart.toString(),
        periodEnd: expectedBudget.periodEnd.toString(),
        categories: expectedTransactionCategories.map((
          { name, type, rate },
        ) => ({
          name,
          type,
          rate,
        })),
      };
      const actual = replaceTransactionCategories(
        expectedBudget.id,
        expectedTransactionCategories,
      );
      assertEquals(actual, expected);
    });
  });
});
