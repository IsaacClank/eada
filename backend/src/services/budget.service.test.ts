import {
  assertEquals,
  assertIsError,
  assertNotEquals,
  assertThrows,
} from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertSpyCalls, SpyLike, stub } from "@std/testing/mock";
import { BudgetDao } from "../db/dao/budget.ts";
import {
  InvalidBudgetException,
  UpsertBudget,
  upsertBudget,
} from "./budget.service.ts";

describe("upsertBudget()", () => {
  let daoUpsertStub: SpyLike;

  beforeEach(() => {
    daoUpsertStub = stub(BudgetDao.prototype, "upsert", (data) => data);
  });

  afterEach(() => {
    daoUpsertStub.restore();
  });

  describe("when id is specified", () => {
    it("should call BudgetDao.upsert with specified id", () => {
      const budgetData: UpsertBudget = {
        id: crypto.randomUUID(),
        periodStart: "2025-01-01T07:00:00+0700",
        periodEnd: "2025-02-01T07:00:00+0700",
        expectedIncome: 100,
        expectedExpense: 50,
        expectedUtilization: 30,
        expectedSurplus: 20,
      };
      const actual = upsertBudget(budgetData);
      assertSpyCalls(daoUpsertStub, 1);
      assertEquals(actual.id, budgetData.id);
    });
  });

  describe("when id is not specified", () => {
    it("should call BudgetDao.upsert with a generated id", () => {
      const budgetData: UpsertBudget = {
        periodStart: "2025-01-01T07:00:00+0700",
        periodEnd: "2025-02-01T07:00:00+0700",
        expectedIncome: 100,
        expectedExpense: 50,
        expectedUtilization: 30,
        expectedSurplus: 20,
      };
      const actual = upsertBudget(budgetData);
      assertSpyCalls(daoUpsertStub, 1);
      assertNotEquals(actual.id, "");
    });
  });

  describe("when expected_expense + expected_utilization + expected_suplus != expected_income", () => {
    it("should throw InvalidBudgetException", () => {
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
      assertIsError(actualError, InvalidBudgetException);
    });
  });
});
