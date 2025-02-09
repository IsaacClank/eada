import { TransactionType } from "@prisma/client";

export interface CreateTransactionDto {
  createdAt: Date | string;
  type: TransactionType;
  amount: number;
  notes: string;
  tags: string[];
}
