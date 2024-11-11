import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";

const route: FastifyPluginAsyncTypebox = async function (app) {
  app.get(
    "/budget",
    {
      onRequest: [app.authorize()],
      schema: {
        response: {
          200: Type.Array(
            Type.Object({
              id: Type.String(),
              name: Type.String(),
              normalizedName: Type.String(),
              income: Type.Number(),
            }),
          ),
        },
      },
    },
    async (req, res) => {
      const { sub: userId } = req.user;

      const budgets = await app.db.budget.findMany({
        where: { userId },
        include: {
          budgetCategories: true,
        },
      });

      if (budgets == null) {
        res.notFound();
        return;
      }

      res.send(
        budgets.map(budget => ({
          id: budget.id,
          name: budget.name,
          normalizedName: budget.normalizedName,
          income: budget.income.toNumber(),
        })),
      );
    },
  );
};
export default route;
