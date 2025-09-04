import { assertEquals } from "@std/assert/equals";
import { assertExists } from "@std/assert/exists";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { Config } from "../../config.ts";
import { Chrono } from "../../lib/chrono.ts";
import { applyDbMigrations } from "../migration.ts";
import { BudgetDao } from "./budget.dao.ts";
import { Budget } from "../entities.ts";

describe("BudgetDao", () => {
  const dao = new BudgetDao();

  beforeEach(async () => {
    await applyDbMigrations();
  });

  afterEach(async () => {
    const rawDbPath = Deno.env.get(Config.DbPath)!;
    const parsedDbPath = rawDbPath.replaceAll("~", Deno.env.get("HOME")!);
    await Deno.remove(parsedDbPath);
  });

  describe("upsert()", () => {
    const id = crypto.randomUUID();

    it("should insert a new record", () => {
      dao.upsert({
        id,
        periodStart: new Chrono(new Date(2025, 0, 1)),
        periodEnd: new Chrono(new Date(2025, 1, 1)),
        expectedIncome: 40000000,
        expectedExpense: 25000000,
        expectedUtilization: 10000000,
        expectedSurplus: 5000000,
      });

      const insertedEntry = dao.getById(id);
      assertExists(insertedEntry);
      assertEquals(insertedEntry.id, id);
    });

    it("should update an existing record based on id", () => {
      dao.upsert({
        id,
        periodStart: new Chrono(new Date(2025, 0, 1)),
        periodEnd: new Chrono(new Date(2025, 1, 1)),
        expectedIncome: 40000000,
        expectedExpense: 25000000,
        expectedUtilization: 13000000,
        expectedSurplus: 2000000,
      });

      const updatedEntry = dao.getById(id);
      assertExists(updatedEntry);
      assertEquals(updatedEntry.id, id);
      assertEquals(updatedEntry.expectedUtilization, 13000000);
      assertEquals(updatedEntry.expectedSurplus, 2000000);
    });
  });

  describe("getByPeriodAsOf()", () => {
    describe("when no record exists and active at the given datetime", () => {
      it("should return null", () => {
        assertEquals(dao.getByPeriodAsOf(Chrono.now()), null);
      });
    });

    describe("when an existing budget is active at the given datetime", () => {
      it("should return the budget", () => {
        const expected: Budget = {
          id: crypto.randomUUID(),
          periodStart: Chrono.from("2025-01-01"),
          periodEnd: Chrono.from("2025-02-01"),
          expectedIncome: 100,
          expectedExpense: 60,
          expectedUtilization: 30,
          expectedSurplus: 10,
        };
        dao.upsert(expected);

        const actual = dao.getByPeriodAsOf(Chrono.from("2025-01-15"));
        assertExists(actual);
        assertEquals(actual.id, expected.id);
      });
    });
  });
});
