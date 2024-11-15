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
                totalRemainingInMonth: Type.Number(),
                totalExpenseInMonth: Type.Number(),
              }),
            ),
          }),
        },
      },
    },
    async req => {
      const { sub: userId } = req.user;
      const { budgetId } = req.params;
      return await app.db.budget.getBudgetOverview(userId, budgetId);
    },
  );
};
export default route;
