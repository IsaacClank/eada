import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { JsonResponse } from "eada/lib/schema";

const routeHandler: FastifyPluginAsyncTypebox = async function (app) {
  app.get(
    "/",
    {
      onRequest: [app.authorize()],
      schema: {
        response: {
          200: JsonResponse(
            Type.Object({
              total: Type.Number(),
            }),
          ),
        },
      },
    },
    async (req, res) => {
      const now = app.dayjs();
      const startOfMonth = now.startOf("month");

      app.log.info(`Retrieving total expenses in ${now.format("MMM, YYYY")}`);
      const totalExpense = await app.db.transaction.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: req.user.sub,
          createdAt: {
            gte: startOfMonth.toDate(),
            lt: startOfMonth.add(1, "month").toDate(),
          },
        },
      });

      res.send({
        data: {
          type: "TotalExpenseInMonth",
          attributes: {
            total: totalExpense._sum.amount?.toNumber() ?? 0,
          },
        },
      });
    },
  );
};
export default routeHandler;
