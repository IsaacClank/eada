import fp from "fastify-plugin";
import { BudgetRepository } from "./budget";

export default fp(async app => {
  app.decorate("repository", {
    budget: new BudgetRepository(app),
  });
});
