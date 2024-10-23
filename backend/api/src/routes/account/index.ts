import * as bcrypt from "bcrypt";
import * as schema from "./schema";
import {
  Type,
  FastifyPluginAsyncTypebox,
} from "@fastify/type-provider-typebox";

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

  // Authenticate
  app.post(
    "/session",
    {
      schema: {
        body: schema.AccountCredentials,
        response: {
          200: Type.Object({
            accessToken: Type.String(),
          }),
          400: app.httpErrorSchema,
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      var user = await db.user.findFirst({ where: { email } });
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

  app.get("/session", { onRequest: [app.authorize()] }, (req, res) => {
    res.send(req.user);
  });
};

export default routes;
