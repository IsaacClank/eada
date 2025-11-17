import { assert, assertEquals, assertExists } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";

import { Config } from "@src/config.ts";
import { Chrono } from "@src/lib/chrono.ts";
import { BudgetData } from "@src/models/budget.model.ts";
import { applyDbMigrations } from "@src/db/migration.ts";
import { getDbConnection } from "@src/db/connection.ts";

import { BudgetRepo } from "./budget.repo.ts";

describe("budget.repo", () => {
  let budgetRepo!: BudgetRepo;

  beforeEach(async () => {
    await applyDbMigrations();
    budgetRepo = new BudgetRepo(getDbConnection());
  });

  afterEach(async () => {
    const rawDbPath = Deno.env.get(Config.DbPath)!;
    const parsedDbPath = rawDbPath.replaceAll("~", Deno.env.get("HOME")!);
    await Deno.remove(parsedDbPath);
  });

  describe("upsert()", () => {
    const expected: BudgetData = {
      id: crypto.randomUUID(),
      periodStart: Chrono.from("2025-01-01"),
      periodEnd: Chrono.from("2025-02-01"),
      expectedIncome: 100,
      expectedExpense: 60,
      expectedUtilization: 30,
      expectedSurplus: 10,
    };

    beforeEach(() => {
      budgetRepo.upsert(expected);
    });

    it("should insert a new record", () => {
      const actual = budgetRepo.getById(expected.id);
      assertExists(actual);
      assert(actual?.equal(expected));
    });

    it("should update an existing record based on id", () => {
      const updatedBudgetData: BudgetData = {
        ...expected,
        expectedExpense: 50,
        expectedSurplus: 20,
      };
      budgetRepo.upsert(updatedBudgetData);

      const actual = budgetRepo.getById(expected.id);
      assertExists(actual);
      assert(actual.equal(updatedBudgetData));
    });
  });

  describe("getById()", () => {
    it("should return the budget with the specified id", () => {
      const expected: BudgetData = {
        id: crypto.randomUUID(),
        periodStart: Chrono.from("2025-01-01"),
        periodEnd: Chrono.from("2025-02-01"),
        expectedIncome: 100,
        expectedExpense: 60,
        expectedUtilization: 30,
        expectedSurplus: 10,
      };
      budgetRepo.upsert(expected);
      const actual = budgetRepo.getById(expected.id);
      assertExists(actual);
      assert(actual.equal(expected));
    });

    describe("when budget does not exist", () => {
      it("should return null", () => {
        const actual = budgetRepo.getById(crypto.randomUUID());
        assert(actual == null);
      });
    });
  });

  describe("getActiveAsOf()", () => {
    describe("when an existing budget is active at the given datetime", () => {
      it("should return the budget", () => {
        const expected: BudgetData = {
          id: crypto.randomUUID(),
          periodStart: Chrono.from("2025-01-01"),
          periodEnd: Chrono.from("2025-02-01"),
          expectedIncome: 100,
          expectedExpense: 60,
          expectedUtilization: 30,
          expectedSurplus: 10,
        };
        budgetRepo.upsert(expected);

        const actual = budgetRepo.getActiveAsOf(Chrono.from("2025-01-15"));
        assertExists(actual);
        assert(actual.equal(expected));
      });
    });

    describe("when budget does not exist", () => {
      it("should return null", () => {
        const actual = budgetRepo.getActiveAsOf(Chrono.from("2025-01-15"));
        assert(actual == null);
      });
    });
  });

  describe("getAll()", () => {
    it("should return all budget records", () => {
      const expected: BudgetData = {
        id: crypto.randomUUID(),
        periodStart: Chrono.from("2025-01-01"),
        periodEnd: Chrono.from("2025-02-01"),
        expectedIncome: 100,
        expectedExpense: 60,
        expectedUtilization: 30,
        expectedSurplus: 10,
      };
      budgetRepo.upsert(expected);

      const actual = budgetRepo.getAll();
      assertEquals(actual.length, 1);
      assertEquals(actual[0].id, expected.id);
    });
  });
});
