import { Status } from "@oak/common/status";
import { BudgetDao } from "../db/dao/budget.dao.ts";
import { Chrono } from "../lib/chrono.ts";
import { HttpException } from "../lib/exception.ts";

export interface UpsertBudget {
  id?: string;
  periodStart: string;
  periodEnd: string;
  expectedIncome: number;
  expectedExpense: number;
  expectedUtilization: number;
  expectedSurplus: number;
}

export interface BudgetResult {
  id: string;
  periodStart: string;
  periodEnd: string;
  expectedIncome: number;
  expectedExpense: number;
  expectedUtilization: number;
  expectedSurplus: number;
}

enum ErrorCode {
  InvalidBudgetState = "InvalidBudgetState",
  BudgetNotFound = "BudgetNotFound",
}

/**
 * @throw HttpException<Status.Conflict>
 */
export function upsertBudget(data: UpsertBudget): BudgetResult {
  if (
    data.expectedExpense
        + data.expectedUtilization
        + data.expectedSurplus != data.expectedIncome
  ) {
    throw new HttpException<Status.Conflict>(
      ErrorCode.InvalidBudgetState.toString(),
      "Expected expense, utilization and surplus do not add up to expected income",
    );
  }

  const budget = new BudgetDao().upsert({
    ...data,
    id: data.id ?? crypto.randomUUID(),
    periodStart: Chrono.from(data.periodStart),
    periodEnd: Chrono.from(data.periodEnd),
  });

  return {
    ...budget,
    periodStart: budget.periodStart.toString(),
    periodEnd: budget.periodEnd.toString(),
  };
}

/**
 * @throw HttpException<Status.NotFound>
 */
export function getBudgetAsOf(asOf: Chrono): BudgetResult {
  const budget = new BudgetDao().getByPeriodAsOf(asOf);

  if (budget == null) {
    throw new HttpException<Status.NotFound>(
      ErrorCode.BudgetNotFound.toString(),
      "No active budget found for the given datetime",
    );
  }

  return {
    ...budget,
    periodStart: budget.periodStart.toString(),
    periodEnd: budget.periodEnd.toString(),
  };
}
