import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
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

      const budgetCategories = req.body;
      const totalPercentageOfIncome = budgetCategories.reduce(
        (total, { percentageOfIncome }) => total + percentageOfIncome,
        0,
      );

      if (totalPercentageOfIncome > 100) {
        throw new InvalidTotalPercentage("Budget breakdown cannot exceed 100%");
      }

      const newBudgetCategoryNames = budgetCategories.map(c => c.name.normalize());
      const removingTagIds = budget.budgetCategories
        .filter(({ normalizedName }) => !newBudgetCategoryNames.includes(normalizedName))
        .reduce((tagIds: string[], category) => tagIds.concat(category.tagId), []);

      await app.db.$transaction([
        app.db.tag.deleteMany({ where: { id: { in: removingTagIds } } }),
        app.db.budget.update({
          where: { id: budget.id },
          data: {
            budgetCategories: {
              upsert: budgetCategories.map(({ name, percentageOfIncome }) => ({
                create: {
                  name,
                  normalizedName: name.normalize(),
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
                where: {
                  budgetId_normalizedName: {
                    budgetId: budget.id,
                    normalizedName: name.normalize(),
                  },
                },
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
