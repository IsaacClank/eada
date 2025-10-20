import * as csv from "@std/csv";
import {
  BudgetCategoryData,
  TransactionType,
} from "../models/budget-category.model.ts";
import { BudgetData } from "../models/budget.model.ts";
import { TransactionData } from "../models/transaction.model.ts";
import { Chrono } from "../lib/chrono.ts";

export class CsvContext {
  budget: BudgetData[] = [];
  budgetCategory: BudgetCategoryData[] = [];
  transaction: TransactionData[] = [];

  constructor(
    budget: string | null,
    budgetCategory: string | null,
    transaction: string | null,
  ) {
    if (budget) {
      this.budget = csv.parse(budget, {
        skipFirstRow: true,
        columns: [
          "period",
          "expectedIncome",
          "expectedExpense",
          "expectedUtilization",
          "expectedSurplus",
        ],
      }).map((rec) => ({
        id: crypto.randomUUID(),
        periodStart: Chrono.from(rec.period).startOf("Month"),
        periodEnd: Chrono.from(rec.period).startOf("Month").next("Month"),
        expectedIncome: Number(rec.expectedIncome),
        expectedExpense: Number(rec.expectedExpense),
        expectedSurplus: Number(rec.expectedSurplus),
        expectedUtilization: Number(rec.expectedUtilization),
      } as BudgetData));
    }

    if (budgetCategory) {
      this.budgetCategory = csv.parse(budgetCategory, {
        skipFirstRow: true,
        fieldsPerRecord: -1,
        columns: ["period", "type", "name", "rate"],
      }).map((rec) => {
        const period = Chrono.from(rec.period);
        const budget = this.budget.find((e) =>
          e.periodStart.beforeOrEqual(period) && period.before(e.periodEnd)
        );
        if (!budget) {
          throw new Error("Corrupted data");
        }

        return {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          type: rec.type as TransactionType,
          name: rec.name,
          rate: Number(rec.rate),
        };
      });
    }

    if (transaction) {
      this.transaction = csv.parse(transaction, {
        skipFirstRow: true,
        fieldsPerRecord: -1,
        columns: ["date", "type", "category", "amount", "note"],
      }).map((rec) => {
        const period = Chrono.from(rec.date);
        const budget = this.budget.find((e) =>
          e.periodStart.beforeOrEqual(period) && period.before(e.periodEnd)
        );
        if (!budget) {
          throw new Error("Corrupted data");
        }

        return {
          id: crypto.randomUUID(),
          budgetId: budget.id,
          timestamp: period,
          category: rec.category,
          amount: Number(rec.amount),
          note: rec.note,
        };
      });
    }
  }
}
