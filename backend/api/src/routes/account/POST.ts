import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import * as bcrypt from "bcrypt";
import * as schema from "./schema";

const routes: FastifyPluginAsyncTypebox = async function (app) {
  app.post(
    "/session",
    {
      schema: {
        body: schema.AccountCredentials,
        response: {
          200: Type.Object({
            accessToken: Type.String(),
          }),
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      var user = await app.db.user.findFirst({ where: { email } });
      if (!user) {
        res.notFound("User does not exist");
        return;
      }

      if (!bcrypt.compareSync(password, user.encryptedPassword)) {
        res.badRequest("Incorrect password");
        return;
      }

      res.send({
        accessToken: app.jwt.sign(
          {
            email: user.email,
            normalizedEmail: user.normalizedEmail,
          },
          {
            ...app.jwt.options.sign,
            sub: user.id,
          },
        ),
      });
    },
  );
};

export default routes;
