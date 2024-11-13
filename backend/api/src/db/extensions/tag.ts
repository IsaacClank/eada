import { PrismaClient } from "@prisma/client";
import { valuesFromSet } from "eada/lib/set";
import { FastifyInstance } from "fastify";

export function extendTagModel(app: FastifyInstance, prisma: PrismaClient) {
  return {
    async createMissingTagsAndReturn(userId: string, tagNames: string[]) {
      const uniqueTagNames = valuesFromSet(
        tagNames.reduce((allTagNames, tagName) => allTagNames.add(tagName), new Set<string>()),
      );
      const parsedTags = uniqueTagNames.map(tagName => parseTagFromTagName(tagName));

      const existingTags = await app.db.tag.findMany({
        where: {
          userId,
          normalizedName: { in: parsedTags.map(t => t.normalizedName) },
        },
      });

      const tagsToCreate = parsedTags.filter(
        tagData =>
          !existingTags.some(existingTag => existingTag.normalizedName === tagData.normalizedName),
      );

      const createdTags = await prisma.tag.createManyAndReturn({
        data: tagsToCreate.map(tagData => ({ ...tagData, userId })),
      });

      return existingTags.concat(createdTags);
    },
  };
}

export function parseTagFromTagName(name: string) {
  const segments = name.split("/");
  const tagName = segments.at(-1);
  const tagPrefix = segments.slice(0, -1).join("/");

  if (tagName == null) {
    throw new InvalidTagName();
  }

  return {
    name: tagName,
    normalizedName: tagName.normalize(),
    info: { prefix: tagPrefix },
  };
}

export class InvalidTagName extends Error {}
