import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import * as bcrypt from "bcrypt";
import * as schema from "./schema";

const routes: FastifyPluginAsyncTypebox = async function (app) {
  const { db } = app;

  // Register
  app.put(
    "/",
    {
      schema: {
        body: schema.AccountCredentials,
        response: {
          200: Type.Object({ id: Type.String() }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      const createdAccount = await db.user.create({
        data: {
          email: email,
          normalizedEmail: email.normalize(),
          encryptedPassword: await bcrypt.hash(password, 10),
        },
        select: { id: true },
      });

      res.send(createdAccount);
    },
  );
};

export default routes;
