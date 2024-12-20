import "@fastify/jwt";
import "@fastify/sensible";
import "@fastify/multipart";
import dayjs from "dayjs";
import "dayjs/plugin/utc";
import { ExtendedPrismaClient } from "eada/db";
import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    db: ExtendedPrismaClient;
    config: FastifyAppConfig;
    httpErrorSchema: { $id: "HttpError" };
    authorize: () => (req: FastifyRequest) => Promise;
    dayjs: typeof dayjs;
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
