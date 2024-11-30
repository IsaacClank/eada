import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Tag, TransactionType } from "@prisma/client";
import * as csv from "csv-parse";
import { NotFoundError } from "eada/lib/error";
import { setFromArray, valuesFromSet } from "eada/lib/set";

const route: FastifyPluginAsyncTypebox = async function (app) {
  app.post("/transaction/migrate", { onRequest: [app.authorize()] }, async (req, res) => {
    const budget = app.db.budget.findFirst({
      where: {
        userId: req.user.sub,
      },
    });
    if (budget == null) {
      throw new NotFoundError("Budget does not exist");
    }

    const parser = csv.parse({
      delimiter: ",",
      columns: ["createdAt", "type", "category", "amount"],
    });
    await req.file().then(f => f?.file.pipe(parser));

    let insertedTransactions = 0;
    let existingCategoryTags: Tag[] = [];
    let transactionsToInsert: ParsedTransactionRecord[] = [];

    for await (const record of parser) {
      transactionsToInsert.push(record);

      const categoryNamesToLookup = valuesFromSet(
        setFromArray(transactionsToInsert.filter(c => c.type !== "Income").map(t => t.category)),
      ).filter(name => existingCategoryTags.every(c => c.normalizedName !== name.normalize()));

      if (categoryNamesToLookup.length > 0) {
        existingCategoryTags = existingCategoryTags.concat(
          await app.db.tag.findMany({
            where: {
              normalizedName: {
                in: categoryNamesToLookup.map(c => c.normalize()),
              },
            },
          }),
        );
        const missingCategories = categoryNamesToLookup.filter(categoryName =>
          existingCategoryTags.every(
            category => category.normalizedName !== categoryName.normalize(),
          ),
        );
        if (missingCategories.length > 0) {
          throw new NotFoundError(
            `The following categories are missing: ${missingCategories.join(", ")}`,
          );
        }
      }

      if (transactionsToInsert.length >= 500) {
        await app.db.transaction.createTransactionsWithTags(
          req.user.sub,
          transactionsToInsert.map(t => ({
            createdAt: app.dayjs(t.createdAt).format(),
            type: t.type as TransactionType,
            amount: t.amount,
            notes: "",
            tags: [t.category],
          })),
          existingCategoryTags,
        );

        insertedTransactions += transactionsToInsert.length;
        transactionsToInsert = [];
      }
    }

    if (transactionsToInsert.length > 0) {
      await app.db.transaction.createTransactionsWithTags(
        req.user.sub,
        transactionsToInsert.map(t => ({
          createdAt: app.dayjs(t.createdAt).format(),
          type: t.type as TransactionType,
          amount: t.amount,
          notes: "",
          tags: [t.category],
        })),
        existingCategoryTags,
      );
      insertedTransactions += transactionsToInsert.length;
    }

    app.log.info(`Inserted ${insertedTransactions} transactions`);
    res.send();
  });
};
export default route;

interface ParsedTransactionRecord {
  createdAt: string;
  type: string;
  category: string;
  amount: number;
}
