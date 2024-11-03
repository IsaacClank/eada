import "@fastify/jwt";
import "@fastify/sensible";
import * as prisma from "@prisma/client";
import dayjs from "dayjs";
import "dayjs/plugin/utc";
import { BudgetRepository } from "eada/repository/budget";
import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    db: prisma.PrismaClient;
    config: FastifyAppConfig;
    httpErrorSchema: { $id: "HttpError" };
    authorize: () => (req: FastifyRequest) => Promise;
    dayjs: typeof dayjs;
    repository: {
      budget: BudgetRepository;
    };
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
    jwtVerify: () => Promise;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      sub: string;
      email: string;
      normalizedEmail: string;
      authenticated: boolean;
    };
  }
}
