import { BudgetDao } from "../db/dao/budget.ts";
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

export interface UpsertBudgetResult extends UpsertBudget {
  id: string;
}

export class InvalidBudgetException extends Exception {
  constructor(cause?: string) {
    super("InvalidBudget", cause);
  }
}

/**
 * @throw InvalidBudgetException
 */
export function upsertBudget(data: UpsertBudget): UpsertBudgetResult {
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
