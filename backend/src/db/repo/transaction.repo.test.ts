import { assert, assertEquals } from "@std/assert";
import { afterEach, beforeEach, describe, it } from "@std/testing/bdd";
import { Chrono } from "../../lib/chrono.ts";
import { BudgetData } from "../../models/budget.model.ts";
import { cleanUpDbAsync } from "../common.ts";
import { getDbConnection } from "../connection.ts";
import { applyDbMigrations } from "../migration.ts";
import { BudgetRepo } from "./budget.repo.ts";
import { TransactionRepo } from "./transaction.repo.ts";
import { TransactionData } from "../../models/transaction.model.ts";

describe("Transaction", () => {
  let budgetRepo!: BudgetRepo;
  let transactionRepo!: TransactionRepo;

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
    transactionRepo = new TransactionRepo(getDbConnection());
    budgetRepo = new BudgetRepo(getDbConnection());

    budgetRepo.upsert(budget);
  });

  afterEach(async () => {
    await cleanUpDbAsync();
  });

  describe("insert", () => {
    it("should creates new transaction records", () => {
      const expected: TransactionData[] = [
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          timestamp: Chrono.from(Chrono.now().unix()),
          amount: 125000,
          category: "Essential",
          note: "",
        },
      ];

      const actual = transactionRepo.insertMany(...expected);
      assertEquals(actual, expected.length);
    });
  });

  describe("getByBudgetId", () => {
    it("should return transactions belonging to a specific budget", () => {
      const expected: TransactionData[] = [
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          timestamp: Chrono.from("2025-01-02"),
          amount: 125000,
          category: "Essential",
          note: "",
        },
      ];
      transactionRepo.insertMany(...expected);

      const actual = transactionRepo.getByBudgetId(budget.id);
      assertEquals(1, actual.length);
      assert(actual[0].equal(expected[0]));
    });
  });
});
