import {
  assertEquals,
  assertIsError,
  assertNotEquals,
  assertThrows,
} from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import {
  assertSpyCallArgs,
  assertSpyCalls,
  SpyLike,
  stub,
} from "@std/testing/mock";
import {
  getBudgetAsOf,
  replaceTransactionCategories,
  upsertBudget,
} from "./budget.service.ts";
import { Chrono } from "../lib/chrono.ts";
import { Status } from "@oak/common/status";
import { HttpException } from "../lib/exception.ts";
import { ForeignKeyConstraintException } from "../db/common.ts";
import { BudgetContract, UpsertBudgetContract } from "../contracts.ts";
import { BudgetDbRecord, BudgetRepo } from "../db/repo/budget.repo.ts";
import {
  BudgetCategoryDbRecord,
  BudgetCategoryRepo,
} from "../db/repo/budget-category.repo.ts";
import { getDbConnection } from "../db/connection.ts";
import { BudgetData } from "../models/budget.model.ts";
import { BudgetCategoryData } from "../models/budget-category.model.ts";

type BudgetRepoStub = {
  upsert?: SpyLike;
  getActiveAsOf?: SpyLike;
  getById?: SpyLike;
};

type BudgetCategoryRepoStub = {
  getByBudgetId?: SpyLike;
  deleteByBudgetId?: SpyLike;
  upsertMany?: SpyLike;
};

describe("budget.service", () => {
  const budgetRepoStub: BudgetRepoStub = {};
  const budgetCategoryRepoStub: BudgetCategoryRepoStub = {};

  describe("upsertBudget", () => {
    beforeEach(() => {
      stub(getDbConnection(), "function", () => ({}));
      budgetRepoStub.upsert?.restore();
      budgetRepoStub.upsert = stub(
        BudgetRepo.prototype,
        "upsert",
        (_) => {},
      );
      budgetCategoryRepoStub.getByBudgetId?.restore();
      budgetCategoryRepoStub.getByBudgetId = stub(
        BudgetCategoryRepo.prototype,
        "getByBudgetId",
        (_) => [],
      );
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
      const budgetData: UpsertBudgetContract = {
        id: crypto.randomUUID(),
        periodStart: "2025-01-01T07:00:00+0700",
        periodEnd: "2025-02-01T07:00:00+0700",
        expectedIncome: 100,
        expectedExpense: 50,
        expectedUtilization: 30,
        expectedSurplus: 20,
      };
      let actualBudget: BudgetContract;

      beforeEach(() => {
        budgetRepoStub.getById?.restore();
        budgetRepoStub.getById = stub(
          BudgetRepo.prototype,
          "getById",
          (_) =>
            ({
              ...budgetData,
              periodStart: Chrono.from(budgetData.periodStart),
              periodEnd: Chrono.from(budgetData.periodEnd),
            }) as BudgetDbRecord,
        );

        actualBudget = upsertBudget(budgetData);
      });

      it("should call Budget.upsert with the specified budget ID", () => {
        assertSpyCalls(budgetRepoStub.upsert!, 1);
        assertEquals(actualBudget.id, budgetData.id);
        assertSpyCalls(budgetCategoryRepoStub.getByBudgetId!, 1);
      });

      it("should call TransactionCategory.getByBudgetId with the specified budget ID", () => {
        assertSpyCalls(budgetCategoryRepoStub.getByBudgetId!, 1);
        assertSpyCallArgs(budgetCategoryRepoStub.getByBudgetId!, 0, [
          budgetData.id,
        ]);
      });
    });

    describe("when an id is not specified", () => {
      const budgetData: UpsertBudgetContract = {
        periodStart: "2025-01-01T07:00:00+0700",
        periodEnd: "2025-02-01T07:00:00+0700",
        expectedIncome: 100,
        expectedExpense: 50,
        expectedUtilization: 30,
        expectedSurplus: 20,
      };
      let actualBudget: BudgetContract;

      beforeEach(() => {
        budgetRepoStub.getById?.restore();
        budgetRepoStub.getById = stub(
          BudgetRepo.prototype,
          "getById",
          (_) =>
            ({
              ...budgetData,
              periodStart: Chrono.from(budgetData.periodStart),
              periodEnd: Chrono.from(budgetData.periodEnd),
            }) as BudgetDbRecord,
        );

        actualBudget = upsertBudget(budgetData);
      });

      it("should call Budget.upsert with a generated id", () => {
        assertSpyCalls(budgetRepoStub.upsert!, 1);
        assertNotEquals(actualBudget.id, "");
      });

      it("should call TransactionCategory.getByBudgetId with the specified budget ID", () => {
        assertSpyCalls(budgetCategoryRepoStub.getByBudgetId!, 1);
        assertSpyCallArgs(budgetCategoryRepoStub.getByBudgetId!, 0, [
          actualBudget.id,
        ]);
      });
    });
  });

  describe("getBudgetAsOf", () => {
    beforeEach(() => {
      stub(getDbConnection(), "function", () => ({}));
      budgetRepoStub.getActiveAsOf?.restore();
      budgetRepoStub.getActiveAsOf = stub(
        BudgetRepo.prototype,
        "getActiveAsOf",
        (_) => null,
      );

      budgetCategoryRepoStub.getByBudgetId?.restore();
      budgetCategoryRepoStub.getByBudgetId = stub(
        BudgetCategoryRepo.prototype,
        "getByBudgetId",
        (_) => [],
      );
    });

    it("should call Budget.getActiveAsOf", () => {
      const asOf = Chrono.from("2025-01-15");
      assertThrows(() => getBudgetAsOf(asOf));
      assertSpyCallArgs(budgetRepoStub.getActiveAsOf!, 0, [asOf]);
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
      const existingBudget: BudgetData = {
        id: crypto.randomUUID(),
        periodStart: Chrono.from("2025-01-01"),
        periodEnd: Chrono.from("2025-02-01"),
        expectedIncome: 100,
        expectedExpense: 60,
        expectedUtilization: 30,
        expectedSurplus: 10,
      };
      let actual: BudgetContract;

      beforeEach(() => {
        budgetRepoStub.getActiveAsOf?.restore();
        budgetRepoStub.getActiveAsOf = stub(
          BudgetRepo.prototype,
          "getActiveAsOf",
          (_) => existingBudget as BudgetDbRecord,
        );

        budgetCategoryRepoStub.getByBudgetId?.restore();
        budgetCategoryRepoStub.getByBudgetId = stub(
          BudgetCategoryRepo.prototype,
          "getByBudgetId",
          (_) => [],
        );

        actual = getBudgetAsOf(Chrono.from("2025-01-15"));
      });

      it("should call TransactionCategory.getByBudgetId", () => {
        assertSpyCallArgs(
          budgetCategoryRepoStub.getByBudgetId!,
          0,
          [existingBudget.id],
        );
        assertSpyCalls(budgetCategoryRepoStub.getByBudgetId!, 1);
      });

      it("should return budget", () => {
        assertEquals(actual.id, existingBudget.id);
      });
    });
  });

  describe("replaceTransactionCategories", () => {
    const expectedBudget: BudgetData = {
      id: crypto.randomUUID(),
      periodStart: Chrono.from("2025-01-01"),
      periodEnd: Chrono.from("2025-01-01"),
      expectedIncome: 100,
      expectedExpense: 50,
      expectedUtilization: 30,
      expectedSurplus: 20,
    };
    const expectedBudgetCategories: BudgetCategoryData[] = [
      {
        id: crypto.randomUUID(),
        budgetId: expectedBudget.id,
        name: "Salary",
        type: "Income",
        rate: 1,
      },
      {
        id: crypto.randomUUID(),
        budgetId: expectedBudget.id,
        name: "All expense",
        type: "Expense",
        rate: 1,
      },
      {
        id: crypto.randomUUID(),
        budgetId: expectedBudget.id,
        name: "Investment & Saving",
        type: "Utilization",
        rate: 1,
      },
    ];

    beforeEach(() => {
      stub(getDbConnection(), "function", () => ({}));
      budgetRepoStub.getById?.restore();
      budgetRepoStub.getById = stub(
        BudgetRepo.prototype,
        "getById",
        (_) => expectedBudget as BudgetDbRecord,
      );

      budgetCategoryRepoStub.deleteByBudgetId?.restore();
      budgetCategoryRepoStub.deleteByBudgetId = stub(
        BudgetCategoryRepo.prototype,
        "deleteByBudgetId",
        (_) => expectedBudgetCategories.length,
      );

      budgetCategoryRepoStub.upsertMany?.restore();
      budgetCategoryRepoStub.upsertMany = stub(
        BudgetCategoryRepo.prototype,
        "upsertMany",
        (_) => expectedBudgetCategories.length,
      );

      budgetCategoryRepoStub.getByBudgetId?.restore();
      budgetCategoryRepoStub.getByBudgetId = stub(
        BudgetCategoryRepo.prototype,
        "getByBudgetId",
        (_) => expectedBudgetCategories as BudgetCategoryDbRecord[],
      );
    });

    describe("when rates of the same type do not add up to 1", () => {
      it("should throw", () => {
        const actual = assertThrows(() =>
          replaceTransactionCategories(expectedBudget.id, [
            {
              name: "Salary",
              type: "Income",
              rate: 0.9,
            },
          ])
        );
        assertIsError(actual, HttpException<Status.BadRequest>);
      });
    });

    it("should call TransactionCategory.deleteByBudgetId", () => {
      replaceTransactionCategories(expectedBudget.id, []);
      assertSpyCallArgs(budgetCategoryRepoStub.deleteByBudgetId!, 0, [
        expectedBudget.id,
      ]);
    });

    describe("when no categories are specified", () => {
      it("should not call TransactionCategory.upsert", () => {
        replaceTransactionCategories(expectedBudget.id, []);
        assertSpyCalls(budgetCategoryRepoStub.upsertMany!, 0);
      });
    });

    it("should call TransactionCategory.upsert", () => {
      replaceTransactionCategories(
        expectedBudget.id,
        expectedBudgetCategories,
      );
      assertSpyCalls(budgetCategoryRepoStub.upsertMany!, 1);
    });

    describe("when using a non-existent budget ID", () => {
      beforeEach(() => {
        budgetCategoryRepoStub.deleteByBudgetId?.restore();
        budgetCategoryRepoStub.deleteByBudgetId = stub(
          BudgetCategoryRepo.prototype,
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
        assertIsError(actual, HttpException<Status.NotFound>);
      });
    });

    it("should call Budget.getByIds", () => {
      replaceTransactionCategories(expectedBudget.id, []);
      assertSpyCallArgs(budgetRepoStub.getById!, 0, [expectedBudget.id]);
    });

    it("should return updated budget data", () => {
      const expected: BudgetContract = {
        ...expectedBudget,
        periodStart: expectedBudget.periodStart.toString(),
        periodEnd: expectedBudget.periodEnd.toString(),
        categories: expectedBudgetCategories.map((x) => ({ ...x })),
      };
      const actual = replaceTransactionCategories(
        expectedBudget.id,
        expectedBudgetCategories,
      );
      assertEquals(actual, expected);
    });
  });
});
