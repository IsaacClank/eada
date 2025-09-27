import { Status } from "@oak/common/status";
import { CreateTransactionContract } from "../contracts.ts";
import { Chrono } from "../lib/chrono.ts";
import { HttpException } from "../lib/exception.ts";
import { ErrorCode } from "./common.ts";
import { getDbConnection } from "../db/connection.ts";
import { BudgetRepo } from "../db/repo/budget.repo.ts";
import { TransactionRepo } from "../db/repo/transaction.repo.ts";

/**
 * @throws {HttpException<Status.BadRequest>} budgetId != transactions[].budgetId
 * @throws {HttpException<Status.NotFound>} No budget could be found for the specified Id
 * @throws {HttpException<Status.Conflict>} Transaction timestmap falls outside of the specified budget active period
 */
export function createTransactions(
  budgetId: string,
  transactions: CreateTransactionContract[],
) {
  const conflictingBudgetId = transactions.some((e) =>
    e.budgetId != null && e.budgetId !== budgetId
  );
  if (conflictingBudgetId) {
    throw new HttpException<Status.BadRequest>(
      ErrorCode.InvalidTransactionData,
      "Conflicting budget ID argument",
    );
  }

  const dbConn = getDbConnection();
  const budgetRepo = new BudgetRepo(dbConn);
  const transactionRepo = new TransactionRepo(dbConn);

  const budget = budgetRepo.getById(budgetId);
  if (budget == null) {
    throw new HttpException<Status.NotFound>(
      ErrorCode.BudgetNotFound,
      "No existing budget can be found with the given ID",
    );
  }

  const anyTimestampOutsideBudgetActivePeriod = transactions.some((e) =>
    Chrono.from(e.timestamp).before(budget.periodStart)
    || Chrono.from(e.timestamp).afterOrEqual(budget.periodEnd)
  );
  if (anyTimestampOutsideBudgetActivePeriod) {
    throw new HttpException<Status.Conflict>(
      ErrorCode.InvalidTransactionData,
      "Transaction timestamp falls outside of specified budget active period",
    );
  }

  return transactionRepo.insertMany(
    ...transactions.map(({ id, timestamp, category, amount, note }) => ({
      id: id ?? crypto.randomUUID(),
      budgetId,
      timestamp: Chrono.from(timestamp),
      category,
      amount,
      note: note ?? "",
    })),
  );
}

/**
 * @throws {HttpException<Status.NotFound>} No budget can be found with the specified budget Id
 */
export function getTransactionsByBudgetId(budgetId: string) {
  const dbConn = getDbConnection();
  const budgetRepo = new BudgetRepo(dbConn);
  const transactionRepo = new TransactionRepo(dbConn);

  const budget = budgetRepo.getById(budgetId);
  if (budget == null) {
    throw new HttpException<Status.NotFound>(
      ErrorCode.BudgetNotFound,
      "No budget can be found with the specified budget Id",
    );
  }

  return transactionRepo.getByBudgetId(budgetId);
}
