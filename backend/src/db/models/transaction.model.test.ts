import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { applyDbMigrations } from "../migration.ts";
import { cleanUpDbAsync } from "../common.ts";
import { Budget } from "./budget.model.ts";
import { Chrono } from "../../lib/chrono.ts";
import { Transaction } from "./transaction.model.ts";
import { assertEquals } from "@std/assert/equals";

describe("Transaction", () => {
  let budget!: Budget;

  beforeEach(async () => {
    await applyDbMigrations();
    budget = Budget.upsert({
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
    await cleanUpDbAsync();
  });

  describe("insert", () => {
    it("should creates new transaction records", () => {
      const expected: Transaction[] = [
        Transaction.from({
          id: crypto.randomUUID(),
          budgetId: budget.id,
          timestamp: Chrono.from(Chrono.now().unix()),
          amount: 125000,
          category: "Essential",
          note: "",
        }),
      ];

      Transaction.insert(...expected);
      const actual = Transaction.getByIds(...expected.map((e) => e.id));
      assertEquals(actual, expected);
    });
  });

  describe("getByBudgetId", () => {
    it("should return transactions belonging to a specific budget", () => {
      const expected: Transaction[] = [
        Transaction.from({
          id: crypto.randomUUID(),
          budgetId: budget.id,
          timestamp: Chrono.from("2025-01-02"),
          amount: 125000,
          category: "Essential",
          note: "",
        }),
      ];
      Transaction.insert(...expected);

      const actual = Transaction.getByBudgetId(budget.id);
      assertEquals(actual, expected);
    });
  });
});
