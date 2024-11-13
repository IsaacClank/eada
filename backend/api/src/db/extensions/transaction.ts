import { PrismaClient, Tag, TransactionType } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { parseTagFromTagName } from "./tag";

export interface CreateTransaction {
  amount: number;
  type: TransactionType;
  createdAt: string;
  notes: string;
  tags: string[];
}

export function extendTransactionModel(_app: FastifyInstance, prisma: PrismaClient) {
  return {
    async createTransactionsWithTags(
      userId: string,
      transactionsData: CreateTransaction[],
      tags: Tag[],
    ) {
      const parsedTransactionsData: CreateTransaction[] = transactionsData.map(transactionData => {
        const { tags: tagNames } = transactionData;
        const tagIds = tagNames
          .map(
            tagName =>
              tags.find(tag => tag.normalizedName === parseTagFromTagName(tagName).normalizedName)
                ?.id,
          )
          .filter(x => x != null);

        transactionData.tags = tagIds;
        return transactionData;
      });

      await Promise.all(
        parsedTransactionsData.map(({ type, notes, amount, createdAt, tags: tagIds }) => {
          return prisma.transaction.create({
            data: {
              amount,
              createdAt,
              notes,
              type,
              userId,
              tagToTransaction: {
                createMany: {
                  data: tagIds.map(tagId => ({ tagId })),
                },
              },
            },
          });
        }),
      );
    },
  };
}
