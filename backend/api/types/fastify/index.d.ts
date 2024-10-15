import * as prisma from "@prisma/client";
import "@fastify/sensible";
import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    db: prisma.PrismaClient;
    config: FastifyAppConfig;
  }

  interface FastifyAppConfig {
    ENVIRONMENT: string;
    HOST: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
  }

  interface FastifyRequest {
    isProtected?: boolean;
  }
}
