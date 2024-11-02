import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";

const route: FastifyPluginAsyncTypebox = async function (app) {
  app.get(
    "/",
    {
      onRequest: [app.authorize()],
      schema: {
        response: {
          200: Type.Object({
            name: Type.String(),
            normalizedName: Type.String(),
            income: Type.Number(),
          }),
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
        name: budget.name,
        normalizedName: budget.normalizedName,
        income: budget.income.toNumber(),
      });
    },
  );
};
export default route;
