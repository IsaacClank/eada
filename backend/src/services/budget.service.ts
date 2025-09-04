import { BudgetDao } from "../db/dao/budget.dao.ts";
import { Chrono } from "../lib/chrono.ts";
import { Exception } from "../lib/exception.ts";

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

export class InvalidBudgetException extends Exception {
  constructor(cause?: string) {
    super("InvalidBudget", cause);
  }
}

/**
 * @throw InvalidBudgetException
 */
export function upsertBudget(data: UpsertBudget): BudgetResult {
  if (
    data.expectedExpense
        + data.expectedUtilization
        + data.expectedSurplus != data.expectedIncome
  ) {
    throw new InvalidBudgetException(
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
 * @throw InvalidBudgetException
 */
export function getBudgetAsOf(asOf: Chrono): BudgetResult {
  const budget = new BudgetDao().getByPeriodAsOf(asOf);

  if (budget == null) {
    throw new InvalidBudgetException(
      "No active budget found for the given datetime",
    );
  }

  return {
    ...budget,
    periodStart: budget.periodStart.toString(),
    periodEnd: budget.periodEnd.toString(),
  };
}
