import { Status } from "@oak/common/status";
import { CreateTransactionContract } from "../contracts.ts";
import { Budget } from "../db/models/budget.model.ts";
import { Transaction } from "../db/models/transaction.model.ts";
import { Chrono } from "../lib/chrono.ts";
import { HttpException } from "../lib/exception.ts";
import { ErrorCode } from "./common.ts";

export function createTransactions(
  budgetId: string,
  transactions: CreateTransactionContract[],
) {
  const conflictingBudgetId = transactions.some((e) =>
    e.budgetId != null && e.budgetId !== budgetId
  );
  if (conflictingBudgetId) {
    throw new HttpException<Status.BadRequest>(
      ErrorCode.InvalidInput,
      "Conflicting budget ID argument",
    );
  }

  const budget = Budget.getByIds(budgetId)[0];
  if (budget == null) {
    throw new HttpException<Status.NotFound>("");
  }

  const anyTimestampOutsideBudgetActivePeriod = transactions.some((e) =>
    Chrono.from(e.timestamp).before(budget.periodStart)
    || Chrono.from(e.timestamp).afterOrEqual(budget.periodEnd)
  );
  if (anyTimestampOutsideBudgetActivePeriod) {
    throw new HttpException<Status.Conflict>(
      ErrorCode.InvalidInput,
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
