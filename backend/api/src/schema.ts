import { TSchema, Type } from "@fastify/type-provider-typebox";

export const JsonResponse = <T extends TSchema>(schema: T) =>
  Type.Object({
    data: JsonEntityData(schema),
  });

const JsonEntityData = <T extends TSchema>(schema: T) =>
  Type.Object({
    type: Type.String(),
    id: Type.Optional(Type.String()),
    attributes: schema,
    relationships: Type.Optional(Type.Record(Type.String(), JsonEntityRelationship)),
  });

const JsonEntityRelationship = Type.Object({
  type: Type.String(),
  id: Type.String(),
});
