import { beforeEach, describe, it } from "@std/testing/bdd";
import {
  assertSpyCallArgs,
  assertSpyCalls,
  SpyLike,
  stub,
} from "@std/testing/mock";
import {
  createTransactions,
  getTransactionsByBudgetId,
} from "./transaction.service.ts";
import { Chrono, ChronoFormat } from "../lib/chrono.ts";
import { assertEquals, assertIsError, assertThrows } from "@std/assert";
import { HttpException } from "../lib/exception.ts";
import { Status } from "@oak/common/status";
import { BudgetDbRecord, BudgetRepo } from "../db/repo/budget.repo.ts";
import {
  TransactionDbRecord,
  TransactionRepo,
} from "../db/repo/transaction.repo.ts";
import { getDbConnection } from "../db/connection.ts";
import { TransactionData } from "../models/transaction.model.ts";
import { BudgetData } from "../models/budget.model.ts";

type BudgetRepoStub = {
  getById?: SpyLike;
};

type TransactionRepoStub = {
  insert?: SpyLike;
  getByBudgetId?: SpyLike;
};

describe("transaction.service", () => {
  stub(getDbConnection(), "function", () => ({}));
  const budgetRepoStub: BudgetRepoStub = {};
  const transactionRepoStub: TransactionRepoStub = {};

  const budget: BudgetData = {
    id: crypto.randomUUID(),
    periodStart: Chrono.from("2025-01-01"),
    periodEnd: Chrono.from("2025-02-01"),
    expectedIncome: 100,
    expectedExpense: 60,
    expectedUtilization: 30,
    expectedSurplus: 10,
  };

  beforeEach(() => {
    budgetRepoStub.getById?.restore();
    budgetRepoStub.getById = stub(
      BudgetRepo.prototype,
      "getById",
      (_) => budget as BudgetDbRecord,
    );

    transactionRepoStub.insert?.restore();
    transactionRepoStub.insert = stub(
      TransactionRepo.prototype,
      "insertMany",
      (...data: TransactionData[]) => data.length,
    );

    transactionRepoStub.getByBudgetId?.restore();
    transactionRepoStub.getByBudgetId = stub(
      TransactionRepo.prototype,
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
      assertSpyCallArgs(budgetRepoStub.getById!, 0, [budget.id]);
      assertSpyCalls(budgetRepoStub.getById!, 1);
    });

    describe("when budget does not exists", () => {
      budgetRepoStub.getById?.restore();
      budgetRepoStub.getById = stub(
        BudgetRepo.prototype,
        "getById",
        (..._) => null,
      );

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
      const transactions: TransactionData[] = [
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          timestamp: Chrono.from("2025-01-05"),
          category: "Essentials",
          amount: 100000,
          note: "",
        },
      ];
      createTransactions(
        budget.id,
        transactions.map((e) => ({
          ...e,
          timestamp: e.timestamp.toString(ChronoFormat.Iso8061),
        })),
      );
      assertSpyCallArgs(
        transactionRepoStub.insert!,
        0,
        transactions.map((e) => ({ ...e })),
      );
      assertSpyCalls(transactionRepoStub.insert!, 1);
    });
  });

  describe("getTransactionsByBudgetId", () => {
    it("should call Budget.getByBudgetIds", () => {
      const budgetId = crypto.randomUUID();
      getTransactionsByBudgetId(budgetId);
      assertSpyCallArgs(budgetRepoStub.getById!, 0, [budgetId]);
      assertSpyCalls(budgetRepoStub.getById!, 1);
    });

    describe("when budget cannot be found", () => {
      beforeEach(() => {
        budgetRepoStub.getById?.restore();
        budgetRepoStub.getById = stub(
          BudgetRepo.prototype,
          "getById",
          (_) => null,
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
      assertSpyCallArgs(transactionRepoStub.getByBudgetId!, 0, [budget.id]);
      assertSpyCalls(transactionRepoStub.getByBudgetId!, 1);
    });

    it("should return result from Transaction.getByBudgetId", () => {
      const expected: TransactionData[] = [
        {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          timestamp: Chrono.from(budget.periodStart),
          category: "Grocery",
          amount: 100000,
          note: "",
        },
      ];

      transactionRepoStub.getByBudgetId?.restore();
      transactionRepoStub.getByBudgetId = stub(
        TransactionRepo.prototype,
        "getByBudgetId",
        (_) => expected as TransactionDbRecord[],
      );

      assertEquals(getTransactionsByBudgetId(budget.id), expected);
    });
  });
});
