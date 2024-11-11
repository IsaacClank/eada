import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";

const route: FastifyPluginAsyncTypebox = async function (app) {
  app.get(
    "/budget/:budgetId",
    {
      onRequest: [app.authorize()],
      schema: {
        params: Type.Object({
          budgetId: Type.String(),
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            normalizedName: Type.String(),
            income: Type.Number(),
            totalRemainingInMonth: Type.Number(),
            totalExpenseInMonth: Type.Number(),
            categories: Type.Array(
              Type.Object({
                id: Type.String(),
                name: Type.String(),
                normalizedName: Type.String(),
                percentageOfIncome: Type.Number(),
              }),
            ),
          }),
        },
      },
    },
    async (req, res) => {
      const { sub: userId } = req.user;
      const { budgetId } = req.params;

      const budget = await app.db.budget.findFirst({
        where: { id: budgetId, userId },
        include: {
          budgetCategories: true,
        },
      });

      if (budget == null) {
        res.notFound();
        return;
      }

      res.send({
        id: budget.id,
        name: budget.name,
        normalizedName: budget.normalizedName,
        income: budget.income.toNumber(),
        totalExpenseInMonth: await app.db.budget.totalExpenseInMonth(userId),
        totalRemainingInMonth: await app.db.budget.totalRemainingBudgetInMonth(userId),
        categories: budget.budgetCategories.map(
          ({ id, name, normalizedName, percentageOfIncome }) => ({
            id,
            name,
            normalizedName,
            percentageOfIncome: percentageOfIncome.toNumber(),
          }),
        ),
      });
    },
  );
};
export default route;
