import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { applyDbMigrations } from "../migration.ts";
import { cleanUpDbAsync } from "../common.ts";
import { Budget } from "./budget.model.ts";
import { Chrono } from "../../lib/chrono.ts";
import { TransactionCategory } from "./transaction-category.model.ts";
import { Transaction } from "./transaction.model.ts";
import { assertEquals } from "@std/assert/equals";

describe("Transaction", () => {
  let budget!: Budget;
  let transactionCategories: TransactionCategory[] = [];

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
    transactionCategories = TransactionCategory.upsert(
      TransactionCategory.from({
        id: crypto.randomUUID(),
        budgetId: budget.id,
        name: "Salary",
        type: "Income",
        rate: 1,
      }),
      TransactionCategory.from({
        id: crypto.randomUUID(),
        budgetId: budget.id,
        name: "Essential",
        type: "Expense",
        rate: 0.5,
      }),
      TransactionCategory.from({
        id: crypto.randomUUID(),
        budgetId: budget.id,
        name: "Non-Essential",
        type: "Expense",
        rate: 0.5,
      }),
      TransactionCategory.from({
        id: crypto.randomUUID(),
        budgetId: budget.id,
        name: "Saving",
        type: "Utilization",
        rate: 0.5,
      }),
      TransactionCategory.from({
        id: crypto.randomUUID(),
        budgetId: budget.id,
        name: "Investment",
        type: "Utilization",
        rate: 0.5,
      }),
    );
  });

  afterEach(async () => {
    await cleanUpDbAsync();
  });

  describe("insert", () => {
    it("should creates new transaction records", () => {
      const expected: Transaction[] = [
        Transaction.from({
          id: crypto.randomUUID(),
          timestamp: Chrono.from(Chrono.now().unix()),
          amount: 125000,
          categoryId: transactionCategories
            .find((c) => c.name === "Essential")!
            .id,
          note: "",
        }),
      ];

      Transaction.insert(...expected);
      const actual = Transaction.getByIds(...expected.map((e) => e.id));
      assertEquals(actual, expected);
    });
  });
});
