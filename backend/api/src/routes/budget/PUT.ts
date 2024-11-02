import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";

const route: FastifyPluginAsyncTypebox = async function (app) {
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

      const upsertedBudget = await app.db.budget.upsert({
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
};
export default route;
