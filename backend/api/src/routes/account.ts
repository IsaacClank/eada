import {
  Type,
  FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";
import * as bcrypt from "bcrypt";

const routes: FastifyPluginAsyncTypebox = async function (fastify) {
  fastify.put(
    "/",
    {
      schema: {
        body: Type.Object({
          email: Type.String(),
          password: Type.String(),
        }),
        response: {
          200: Type.Object({ id: Type.String() }),
        },
      },
    },
    async (req) => {
      const { db } = fastify;
      const { email, password } = req.body;

      return await db.user.create({
        data: {
          email: email,
          normalizedEmail: email.normalize(),
          encryptedPassword: await bcrypt.hash(password, 10),
        },
        select: { id: true },
      });
    },
  );
};

export default routes;
