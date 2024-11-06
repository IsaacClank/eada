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
      });

      if (budget == null) {
        throw new NotFoundError("Budget does not exist");
      }

      const categories = req.body;
      const totalPercentageOfIncome = categories.reduce(
        (total, { percentageOfIncome }) => total + percentageOfIncome,
        0,
      );

      if (totalPercentageOfIncome > 100) {
        throw new InvalidTotalPercentage("Budget breakdown cannot exceed 100%");
      }

      await app.db.budget.update({
        where: { id: budget.id },
        data: {
          budgetCategories: {
            deleteMany: {
              normalizedName: {
                notIn: categories.map(c => c.name.normalize()),
              },
            },
            upsert: categories.map(({ name, percentageOfIncome }) => ({
              create: { name, normalizedName: name.normalize(), percentageOfIncome },
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
      });

      res.send();
    },
  );
};
export default route;

export class InvalidTotalPercentage extends Error {}
