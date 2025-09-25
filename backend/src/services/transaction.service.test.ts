import { beforeEach, describe, it } from "@std/testing/bdd";
import {
  assertSpyCallArgs,
  assertSpyCalls,
  SpyLike,
  stub,
} from "@std/testing/mock";
import { Transaction } from "../db/models/transaction.model.ts";
import {
  createTransactions,
  getTransactionsByBudgetId,
} from "./transaction.service.ts";
import { Chrono, ChronoFormat } from "../lib/chrono.ts";
import { Budget } from "../db/models/budget.model.ts";
import { assertEquals, assertIsError, assertThrows } from "@std/assert";
import { HttpException } from "../lib/exception.ts";
import { Status } from "@oak/common/status";

type BudgetStub = {
  getByIds?: SpyLike;
};

type TransactionStub = {
  insert?: SpyLike;
  getByBudgetId?: SpyLike;
};

describe("transaction.service", () => {
  const budgetStub: BudgetStub = {};
  const transactionStub: TransactionStub = {};

  const budget = Budget.from({
    id: crypto.randomUUID(),
    periodStart: Chrono.from("2025-01-01"),
    periodEnd: Chrono.from("2025-02-01"),
    expectedIncome: 100,
    expectedExpense: 60,
    expectedUtilization: 30,
    expectedSurplus: 10,
  });

  beforeEach(() => {
    budgetStub.getByIds?.restore();
    budgetStub.getByIds = stub(
      Budget,
      "getByIds",
      (..._: string[]) => [budget],
    );

    transactionStub.insert?.restore();
    transactionStub.insert = stub(
      Transaction,
      "insert",
      (...data: Transaction[]) => data.length,
    );

    transactionStub.getByBudgetId?.restore();
    transactionStub.getByBudgetId = stub(
      Transaction,
      "getByBudgetId",
      (_) => [],
    );
  });

  describe("createTransactions", () => {
    describe("when budgetId arg != CreateTransactionContract[].budgetId", () => {
      it("should throw", () => {
        const actualError = assertThrows(() =>
          createTransactions(budget.id, [{
            budgetId: crypto.randomUUID(),
            timestamp: "2025-01-01",
            amount: 100,
            category: "Take-out",
          }])
        );

        assertIsError(actualError, HttpException<Status.BadRequest>);
      });
    });

    it("should call Budget.getByIds", () => {
      createTransactions(budget.id, [
        {
          timestamp: "2025-01-01",
          category: "Drinks",
          amount: 100,
        },
      ]);
      assertSpyCallArgs(budgetStub.getByIds!, 0, [budget.id]);
      assertSpyCalls(budgetStub.getByIds!, 1);
    });

    describe("when budget does not exists", () => {
      budgetStub.getByIds?.restore();
      budgetStub.getByIds = stub(Budget, "getByIds", (..._) => []);

      it("should throw", () => {
        const actualError = assertThrows(() =>
          createTransactions(budget.id, [{
            budgetId: crypto.randomUUID(),
            timestamp: "2025-01-01",
            amount: 100,
            category: "Take-out",
          }])
        );

        assertIsError(actualError, HttpException<Status.NotFound>);
      });
    });

    describe("when any transaction timestmap falls outside of budget active period", () => {
      it("should throw", () => {
        const actualError = assertThrows(() =>
          createTransactions(budget.id, [{
            timestamp: "2025-02-01",
            amount: 100,
            category: "Take-out",
          }])
        );

        assertIsError(actualError, HttpException<Status.Conflict>);
      });
    });

    it("should call Transaction.insert", () => {
      const transactions = [
        Transaction.from({
          id: crypto.randomUUID(),
          budgetId: budget.id,
          timestamp: Chrono.from("2025-01-05"),
          category: "Essentials",
          amount: 100000,
          note: "",
        }),
      ];
      createTransactions(
        budget.id,
        transactions.map((e) => ({
          ...e,
          timestamp: e.timestamp.toString(ChronoFormat.Iso8061),
        })),
      );
      assertSpyCallArgs(
        transactionStub.insert!,
        0,
        transactions.map((e) => ({ ...e })),
      );
      assertSpyCalls(transactionStub.insert!, 1);
    });
  });

  describe("getTransactionsByBudgetId", () => {
    it("should call Budget.getByBudgetIds", () => {
      const budgetId = crypto.randomUUID();
      getTransactionsByBudgetId(budgetId);
      assertSpyCallArgs(budgetStub.getByIds!, 0, [budgetId]);
      assertSpyCalls(budgetStub.getByIds!, 1);
    });

    describe("when budget cannot be found", () => {
      beforeEach(() => {
        budgetStub.getByIds?.restore();
        budgetStub.getByIds = stub(
          Budget,
          "getByIds",
          (..._: string[]) => [],
        );
      });

      it("should throw", () => {
        const actual = assertThrows(() =>
          getTransactionsByBudgetId(crypto.randomUUID())
        );
        assertIsError(actual, HttpException<Status.NotFound>);
      });
    });

    it("should call Transaction.getByBudgetId", () => {
      getTransactionsByBudgetId(budget.id);
      assertSpyCallArgs(transactionStub.getByBudgetId!, 0, [budget.id]);
      assertSpyCalls(transactionStub.getByBudgetId!, 1);
    });

    it("should return result from Transaction.getByBudgetId", () => {
      const expected = [
        Transaction.from({
          id: crypto.randomUUID(),
          budgetId: budget.id,
          timestamp: Chrono.from(budget.periodStart),
          category: "Grocery",
          amount: 100000,
          note: "",
        }),
      ];

      transactionStub.getByBudgetId?.restore();
      transactionStub.getByBudgetId = stub(
        Transaction,
        "getByBudgetId",
        (_) => expected,
      );

      assertEquals(getTransactionsByBudgetId(budget.id), expected);
    });
  });
});
