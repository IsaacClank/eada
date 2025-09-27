import { Chrono } from "../lib/chrono.ts";
import { IEqual } from "../lib/common.ts";

export interface TransactionData {
  id: string;
  budgetId: string;
  timestamp: Chrono;
  category: string;
  amount: number;
  note: string;
}

export class TransactionModel
  implements TransactionData, IEqual<TransactionData> {
  id: string;
  budgetId: string;
  timestamp: Chrono;
  category: string;
  amount: number;
  note: string;

  constructor(data: TransactionData) {
    this.id = data.id;
    this.budgetId = data.id;
    this.timestamp = data.timestamp;
    this.category = data.category;
    this.amount = data.amount;
    this.note = data.note;
  }

  equal(other: TransactionData): boolean {
    return this.id === other.id
      && this.budgetId === other.budgetId
      && this.timestamp === other.timestamp
      && this.category === other.category
      && this.amount === other.amount
      && this.note === other.note;
  }
}
