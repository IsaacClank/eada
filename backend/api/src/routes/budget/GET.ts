import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { JsonResponse } from "eada/schema";

const route: FastifyPluginAsyncTypebox = async function (app) {
  app.get(
    "/",
    {
      onRequest: [app.authorize()],
      schema: {
        response: {
          200: JsonResponse(
            Type.Object({
              id: Type.String(),
              name: Type.String(),
              normalizedName: Type.String(),
              income: Type.Number(),
              totalRemainingInMonth: Type.Number(),
              totalExpenseInMonth: Type.Number(),
              categories: Type.Array(
                Type.Object({
                  name: Type.String(),
                  normalizedName: Type.String(),
                  percentangeOfIncome: Type.Number(),
                }),
              ),
            }),
          ),
        },
      },
    },
    async (req, res) => {
      const { sub: userId } = req.user;
      const budget = await app.db.budget.findFirst({
        where: { userId },
        include: {
          budgetCategories: true,
        },
      });

      if (budget == null) {
        res.notFound();
        return;
      }

      res.send({
        data: {
          type: "Budget",
          attributes: {
            id: budget.id,
            name: budget.name,
            normalizedName: budget.normalizedName,
            income: budget.income.toNumber(),
            totalExpenseInMonth: await app.db.budget.totalExpenseInMonth(userId),
            totalRemainingInMonth: await app.db.budget.totalRemainingBudgetInMonth(userId),
            categories: budget.budgetCategories.map(
              ({ name, normalizedName, percentageOfIncome }) => ({
                name,
                normalizedName,
                percentangeOfIncome: percentageOfIncome.toNumber(),
              }),
            ),
          },
        },
      });
    },
  );
};
export default route;
