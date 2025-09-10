import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { applyDbMigrations } from "../migration.ts";
import { Config } from "../../config.ts";
import { Chrono } from "../../lib/chrono.ts";
import { assertArrayIncludes, assertEquals } from "@std/assert";
import { Budget } from "./budget.ts";

describe("Budget", () => {
  beforeEach(async () => {
    await applyDbMigrations();
  });

  afterEach(async () => {
    const rawDbPath = Deno.env.get(Config.DbPath)!;
    const parsedDbPath = rawDbPath.replaceAll("~", Deno.env.get("HOME")!);
    await Deno.remove(parsedDbPath);
  });

  describe("upsert()", () => {
    const expectedBudget = Budget.from({
      id: crypto.randomUUID(),
      periodStart: Chrono.from("2025-01-01"),
      periodEnd: Chrono.from("2025-02-01"),
      expectedIncome: 100,
      expectedExpense: 60,
      expectedUtilization: 30,
      expectedSurplus: 10,
    });

    it("should insert a new record", () => {
      Budget.upsert(expectedBudget);

      const actual = Budget.getByIds(expectedBudget.id);
      assertEquals(actual.length, 1);
      assertArrayIncludes(actual, [expectedBudget]);
    });

    it("should update an existing record based on id", () => {
      Budget.upsert(expectedBudget);

      const expectedUpdatedBudget = Budget.from(expectedBudget);
      expectedUpdatedBudget.expectedExpense = 50;
      expectedUpdatedBudget.expectedSurplus = 20;
      Budget.upsert(expectedUpdatedBudget);

      const actual = Budget.getByIds(expectedBudget.id);

      assertEquals(actual.length, 1);
      assertArrayIncludes(actual, [expectedUpdatedBudget]);
    });
  });

  describe("getActiveAsOf()", () => {
    describe("when an existing budget is active at the given datetime", () => {
      it("should return the budget", () => {
        const expected: Budget = Budget.from({
          id: crypto.randomUUID(),
          periodStart: Chrono.from("2025-01-01"),
          periodEnd: Chrono.from("2025-02-01"),
          expectedIncome: 100,
          expectedExpense: 60,
          expectedUtilization: 30,
          expectedSurplus: 10,
        });
        Budget.upsert(expected);

        const actual = Budget.getActiveAsOf(Chrono.from("2025-01-15"));
        assertEquals(actual.length, 1);
        assertArrayIncludes(actual, [expected]);
      });
    });
  });
});
