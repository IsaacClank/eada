import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      ENVIRONMENT: string;
      HOST: string;
      PORT: number;
      DATABASE_URL: string;
    };
  }
}
