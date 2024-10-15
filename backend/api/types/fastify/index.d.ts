import * as prisma from "@prisma/client";
import "@fastify/jwt";
import "@fastify/sensible";
import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    db: prisma.PrismaClient;
    config: FastifyAppConfig;
    httpErrorSchema: { $id: "HttpError" };
    authorize: () => (req: FastifyRequest) => Promise;
  }

  interface FastifyAppConfig {
    ENVIRONMENT: string;
    HOST: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_DURATION: number;
    JWT_ISSUER: string;
    JWT_SECRET: string;
  }

  interface FastifyRequest {
    protected?: boolean;
  }
}
