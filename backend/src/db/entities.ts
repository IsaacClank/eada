import { Chrono } from "../lib/chrono.ts";

export interface Budget {
  id: string;
  periodStart: Chrono;
  periodEnd: Chrono;
  expectedIncome: number;
  expectedExpense: number;
  expectedUtilization: number;
  expectedSurplus: number;
}
