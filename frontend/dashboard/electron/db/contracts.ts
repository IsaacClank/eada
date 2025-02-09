import { TransactionType } from "@prisma/client";

export interface CreateBudgetCategory {
  name: string;
  percentageOfIncome: number;
}

export interface CreateTransaction {
  createdAt: Date | string;
  type: TransactionType;
  amount: number;
  notes: string;
  tags: string[];
}
