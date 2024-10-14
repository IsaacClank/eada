import {
  Type,
  FastifyPluginAsyncTypebox,
  Static,
} from "@fastify/type-provider-typebox";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const routes: FastifyPluginAsyncTypebox = async function (fastify) {
  const { db } = fastify;

  fastify.put(
    "/",
    {
      schema: {
        body: AccountCredentials,
        response: {
          200: Type.Object({ id: Type.String() }),
        },
      },
    },
    async (req) => {
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

  fastify.post(
    "/session",
    {
      schema: {
        body: AccountCredentials,
        response: {
          200: {
            accessToken: Type.String(),
          },
          400: {
            message: Type.String(),
          },
        },
      },
    },
    async (req, res) => {
      const { email, password } = req.body;

      var user = await db.user.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        res.code(404).send("User does not exist");
        return;
      }

      if (!bcrypt.compareSync(password, user.encryptedPassword)) {
        res.code(400).send("Incorrect password");
        return;
      }

      res.send({
        accessToken: jwt.sign(
          {
            email: user.email,
            normalizedEmail: user.normalizedEmail,
            authenticated: true,
          },
          fastify.config.JWT_SECRET,
        ),
      } as AuthenticationResponse);
    },
  );
};

export default routes;

const AccountCredentials = Type.Object({
  email: Type.String(),
  password: Type.String(),
});
type AccountCredentials = Static<typeof AccountCredentials>;

const AuthenticationResponse = Type.Object({
  accessToken: Type.String(),
});
type AuthenticationResponse = Static<typeof AuthenticationResponse>;
