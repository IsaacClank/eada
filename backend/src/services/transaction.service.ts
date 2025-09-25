import { Status } from "@oak/common/status";
import { CreateTransactionContract } from "../contracts.ts";
import { Budget } from "../db/models/budget.model.ts";
import { Transaction } from "../db/models/transaction.model.ts";
import { Chrono } from "../lib/chrono.ts";
import { HttpException } from "../lib/exception.ts";
import { ErrorCode } from "./common.ts";
import { collect } from "../lib/collection.ts";

export function createTransactions(
  budgetId: string,
  transactions: CreateTransactionContract[],
) {
  const conflictingBudgetId = transactions.some((e) =>
    e.budgetId != null && e.budgetId !== budgetId
  );
  if (conflictingBudgetId) {
    throw new HttpException<Status.BadRequest>(
      ErrorCode.InvalidTransactionState,
      "Conflicting budget ID argument",
    );
  }

  const budget = Budget.getByIds(budgetId)[0];
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
      ErrorCode.InvalidTransactionState,
      "Transaction timestamp falls outside of specified budget active period",
    );
  }

  return Transaction.insert(
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
 * @throw HttpException<Status.NotFound> No budget can be found with the specified budget Id
 */
export function getTransactionsByBudgetId(budgetId: string) {
  const budgets = collect(Budget.getByIds(budgetId));
  if (budgets.isEmpty()) {
    throw new HttpException<Status.NotFound>(
      ErrorCode.BudgetNotFound,
      "No budget can be found with the specified budget Id",
    );
  }

  return Transaction.getByBudgetId(budgetId);
}
