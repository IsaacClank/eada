import { IEqual } from "../lib/common.ts";

export type TransactionType = "Income" | "Expense" | "Utilization";

export interface BudgetCategoryData {
  id: string;
  budgetId: string;
  name: string;
  type: TransactionType;
  rate: number;
}

export class BudgetCategoryModel
  implements BudgetCategoryData, IEqual<BudgetCategoryData> {
  id: string;
  budgetId: string;
  name: string;
  type: TransactionType;
  rate: number;

  constructor(data: BudgetCategoryData) {
    this.id = data.id;
    this.budgetId = data.budgetId;
    this.name = data.name;
    this.type = data.type;
    this.rate = data.rate;
  }

  equal(other: BudgetCategoryData): boolean {
    return this.id === other.id
      && this.budgetId === other.budgetId
      && this.name === other.name
      && this.type === other.type
      && this.rate === other.rate;
  }
}
