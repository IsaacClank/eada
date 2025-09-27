import { Chrono } from "../lib/chrono.ts";
import { IEqual } from "../lib/common.ts";

export interface BudgetData {
  id: string;
  periodStart: Chrono;
  periodEnd: Chrono;
  expectedIncome: number;
  expectedExpense: number;
  expectedUtilization: number;
  expectedSurplus: number;
}

export class BudgetModel implements BudgetData, IEqual<BudgetData> {
  id: string;
  periodStart: Chrono;
  periodEnd: Chrono;
  expectedIncome: number;
  expectedExpense: number;
  expectedUtilization: number;
  expectedSurplus: number;

  constructor(data: BudgetData) {
    this.id = data.id;
    this.periodStart = data.periodStart;
    this.periodEnd = data.periodEnd;
    this.expectedIncome = data.expectedIncome;
    this.expectedExpense = data.expectedExpense;
    this.expectedUtilization = data.expectedUtilization;
    this.expectedSurplus = data.expectedSurplus;
  }

  equal(other: BudgetData): boolean {
    return this.id === other.id
      && this.periodStart === other.periodEnd
      && this.periodEnd === other.periodEnd
      && this.expectedIncome === other.expectedIncome
      && this.expectedExpense === other.expectedExpense
      && this.expectedUtilization === other.expectedUtilization
      && this.expectedSurplus === other.expectedSurplus;
  }
}
