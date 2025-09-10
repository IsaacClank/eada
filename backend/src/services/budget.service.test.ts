import {
  assertEquals,
  assertIsError,
  assertNotEquals,
  assertThrows,
} from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { assertSpyCalls, SpyLike, stub } from "@std/testing/mock";
import { getBudgetAsOf, UpsertBudget, upsertBudget } from "./budget.service.ts";
import { Chrono } from "../lib/chrono.ts";
import { Status } from "@oak/common/status";
import { HttpException } from "../lib/exception.ts";
import { Budget } from "../db/models/budget.ts";

describe("budget.service", () => {
  describe("upsertBudget()", () => {
    let daoUpsertStub: SpyLike;

    beforeEach(() => {
      daoUpsertStub = stub(Budget, "upsert", (...data) => data);
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
  });

  describe("getBudgetAsOf()", () => {
    let daoUpsertStub: SpyLike | undefined;

    afterEach(() => {
      if (daoUpsertStub) {
        daoUpsertStub.restore();
      }
    });

    describe("when budget exists", () => {
      it("should return budget", () => {
        const expected: Budget = {
          id: crypto.randomUUID(),
          periodStart: Chrono.from("2025-01-01"),
          periodEnd: Chrono.from("2025-02-01"),
          expectedIncome: 100,
          expectedExpense: 60,
          expectedUtilization: 30,
          expectedSurplus: 10,
        };
        daoUpsertStub = stub(Budget, "getActiveAsOf", (_asOf) => [expected]);

        const actual = getBudgetAsOf(Chrono.from("2025-01-15"));

        assertEquals(actual.id, expected.id);
        assertSpyCalls(daoUpsertStub, 1);
      });
    });

    describe("when budget does not exists", () => {
      it("should throw", () => {
        daoUpsertStub = stub(Budget, "getActiveAsOf", (_asOf) => []);

        const actual = assertThrows(() =>
          getBudgetAsOf(Chrono.from("2025-01-15"))
        );

        assertIsError(actual, HttpException<Status.NotFound>);
        assertSpyCalls(daoUpsertStub, 1);
      });
    });
  });
});
