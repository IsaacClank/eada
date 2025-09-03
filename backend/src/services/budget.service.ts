import { BudgetDao } from "../db/dao/budget.ts";
import { Chrono } from "../lib/chrono.ts";

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

export function upsertBudget(data: UpsertBudget) {
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
