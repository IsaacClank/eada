import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { Tag } from "@prisma/client";
import { NotFoundError } from "eada/lib/error";

const route: FastifyPluginAsyncTypebox = async app => {
  app.put(
    "/budget/:budgetId/category",
    {
      onRequest: [app.authorize()],
      schema: {
        params: Type.Object({
          budgetId: Type.String(),
        }),
        body: Type.Array(
          Type.Object({
            name: Type.String(),
            percentageOfIncome: Type.Number(),
          }),
        ),
      },
    },
    async (req, res) => {
      const budget = await app.db.budget.findFirst({
        where: {
          id: req.params.budgetId,
          userId: req.user.sub,
        },
        include: {
          budgetCategories: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (budget == null) {
        throw new NotFoundError("Budget does not exist");
      }

      const budgetCategoriesToUpsert = req.body;

      const totalPercentageOfIncome = budgetCategoriesToUpsert.reduce(
        (total, { percentageOfIncome }) => total + percentageOfIncome,
        0,
      );
      if (totalPercentageOfIncome > 100) {
        throw new InvalidTotalPercentage("Budget breakdown cannot exceed 100%");
      }

      const remainingBudgetCategoryNames = budgetCategoriesToUpsert.map(c => c.name.normalize());

      const removingTagIds = budget.budgetCategories
        .reduce((tags: Tag[], { tag }) => tags.concat(tag), [])
        .filter(tag => !remainingBudgetCategoryNames.includes(tag.normalizedName))
        .map(tag => tag.id);

      const categoryNameToTagId = budget.budgetCategories.reduce((categoryToTagId: any, bc) => {
        if (!removingTagIds.includes(bc.tagId)) {
          categoryToTagId[bc.tag.normalizedName] = bc.tagId;
        }

        return categoryToTagId;
      }, {});

      await app.db.$transaction([
        app.db.tag.deleteMany({ where: { id: { in: removingTagIds } } }),
        app.db.budget.update({
          where: { id: budget.id },
          data: {
            budgetCategories: {
              upsert: budgetCategoriesToUpsert.map(({ name, percentageOfIncome }) => ({
                where: {
                  tagId: categoryNameToTagId[name] ?? "",
                },
                create: {
                  percentageOfIncome,
                  tag: {
                    create: {
                      name,
                      normalizedName: name.normalize(),
                      info: {
                        prefix: "category",
                      },
                      userId: req.user.sub,
                    },
                  },
                },
                update: { percentageOfIncome },
              })),
            },
          },
        }),
      ]);

      res.send();
    },
  );
};
export default route;

export class InvalidTotalPercentage extends Error {}
