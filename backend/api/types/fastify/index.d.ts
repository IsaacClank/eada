import { PrismaClient } from "@prisma/client";
import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    db: PrismaClient;
    config: FastifyAppConfig;
  }

  interface FastifyAppConfig {
    ENVIRONMENT: string;
    HOST: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
  }
}
