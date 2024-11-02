import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";

const routes: FastifyPluginAsyncTypebox = async function (app) {
  const { db } = app;

  app.put(
    "/",
    {
      onRequest: app.authorize(),
      schema: {
        body: Type.Object({
          name: Type.String(),
          income: Type.Number(),
        }),
        response: {
          200: Type.Object({
            id: Type.String(),
            name: Type.String(),
            normalizedName: Type.String(),
            income: Type.Number(),
          }),
        },
      },
    },
    async (req, res) => {
      const { name, income } = req.body;
      const { sub: userId } = req.user;

      const upsertedBudget = await db.budget.upsert({
        where: {
          userId_normalizedName: {
            userId,
            normalizedName: name.normalize(),
          },
        },
        update: {
          name,
          normalizedName: name.normalize(),
          income,
        },
        create: {
          name,
          income,
          normalizedName: name.normalize(),
          userId,
        },
      });

      res.send({
        id: upsertedBudget.id,
        name: upsertedBudget.name,
        normalizedName: upsertedBudget.normalizedName,
        income: upsertedBudget.income.toNumber(),
      });
    },
  );

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
      const budget = await db.budget.findFirst({
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

  app.register(require("./expense/total.route"), { prefix: "expense/total" });
};

export default routes;
