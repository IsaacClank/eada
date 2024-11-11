import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { TransactionType } from "@prisma/client";
import { UnexpectedValueError } from "eada/lib/error";

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

      const parsedInputTags = transactionsData
        .reduce((allTags: string[], { tags }) => allTags.concat(tags), [])
        .filter(t => t.trim().length > 0)
        .map(tagName => parseTagDataFromTagName(tagName));

      const existingTags = await app.db.tag.findMany({
        where: {
          userId: req.user.sub,
          normalizedName: {
            in: parsedInputTags.map(t => t.normalizedName),
          },
        },
      });
      const existingTagNames = existingTags.map(t => t.normalizedName);

      const nonExistentTags = parsedInputTags.filter(
        tag => !existingTagNames.includes(tag.normalizedName),
      );
      const createdTags = await app.db.tag.createManyAndReturn({
        data: nonExistentTags.map(tag => ({
          userId: req.user.sub,
          name: tag.name,
          normalizedName: tag.normalizedName,
          info: tag.info,
        })),
      });

      const referencedTags = existingTags.concat(createdTags);
      const transactionsCreation: Promise<unknown>[] = [];
      req.body.forEach(async ({ createdAt, type, amount, notes, tags }) => {
        const relatedTagIds = tags
          .map(t => {
            const tagData = parseTagDataFromTagName(t);
            return referencedTags.find(t => t.normalizedName === tagData.normalizedName)?.id;
          })
          .filter(t => t != null);

        transactionsCreation.push(
          app.db.transaction.create({
            data: {
              userId: req.user.sub,
              createdAt: app.dayjs(createdAt).format() ?? app.dayjs().format(),
              type,
              amount,
              notes,
              tagToTransaction: {
                createMany: {
                  data: relatedTagIds.map(tagId => ({ tagId })),
                },
              },
            },
          }),
        );
      });

      await Promise.all(transactionsCreation);
      app.log.info(`Inserted ${transactionsData.length} new transactions`);
      res.send();
    },
  );

  function parseTagDataFromTagName(name: string) {
    const segments = name.split("/");

    if (segments.length === 0) {
      throw new UnexpectedValueError("Invalid tag reference");
    }

    const tagName = segments.at(-1);
    if (tagName == null) {
      throw new UnexpectedValueError("Invalid tag name");
    }

    const tagPrefix = segments.slice(0, -1).join("/");

    return {
      name: tagName,
      normalizedName: tagName.normalize(),
      info: {
        prefix: tagPrefix,
      },
    };
  }
};
export default route;
