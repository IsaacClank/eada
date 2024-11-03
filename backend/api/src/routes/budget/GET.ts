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
              name: Type.String(),
              normalizedName: Type.String(),
              income: Type.Number(),
              totalRemainingInMonth: Type.Number(),
              totalExpenseInMonth: Type.Number(),
            }),
          ),
        },
      },
    },
    async (req, res) => {
      const { sub: userId } = req.user;
      const budget = await app.db.budget.findFirst({
        where: { userId },
      });

      if (budget == null) {
        res.notFound();
        return;
      }

      res.send({
        data: {
          type: "Budget",
          attributes: {
            name: budget.name,
            normalizedName: budget.normalizedName,
            income: budget.income.toNumber(),
            totalExpenseInMonth: await app.repository.budget.totalExpenseInMonth(userId),
            totalRemainingInMonth: await app.repository.budget.totalRemainingBudgetInMonth(userId),
          },
        },
      });
    },
  );
};
export default route;
