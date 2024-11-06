import fp from "fastify-plugin";

export default fp(async app => {
  app.get("/health", { onRequest: app.authorize() }, async () => {
    return;
  });

  app.register(require("./account/GET"), { prefix: "account" });
  app.register(require("./account/PUT"), { prefix: "account" });
  app.register(require("./account/POST"), { prefix: "account" });

  app.register(require("./budget/GET"), { prefix: "budget" });
  app.register(require("./budget/PUT"), { prefix: "budget" });
  app.register(require("./budget/:id/category/PUT"));
});
