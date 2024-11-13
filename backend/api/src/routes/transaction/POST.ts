import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { TransactionType } from "@prisma/client";

const route: FastifyPluginAsyncTypebox = async app => {
  app.post(
    "/transaction",
    {
      onRequest: [app.authorize()],
      schema: {
        body: Type.Array(
          Type.Object({
            amount: Type.Number(),
            type: Type.Enum(TransactionType),
            tags: Type.Array(Type.String()),
            createdAt: Type.Optional(Type.String()),
            notes: Type.String({ default: "" }),
          }),
        ),
      },
    },
    async (req, res) => {
      const transactionsData = req.body;

      const allTags = await app.db.tag.createMissingTagsAndReturn(
        req.user.sub,
        transactionsData.reduce((allTags: string[], { tags }) => allTags.concat(tags), []),
      );

      await app.db.transaction.createTransactionsWithTags(
        req.user.sub,
        transactionsData.map(({ amount, type, notes, createdAt, tags }) => ({
          amount,
          notes,
          tags,
          type,
          createdAt: createdAt ? app.dayjs(createdAt).format() : app.dayjs().format(),
        })),
        allTags,
      );

      app.log.info(`Inserted ${transactionsData.length} new transactions`);
      res.send();
    },
  );
};
export default route;
