import { Type } from "@fastify/type-provider-typebox";

export const AccountCredentials = Type.Object({
  email: Type.String(),
  password: Type.String(),
});
