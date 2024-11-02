import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

const route: FastifyPluginAsyncTypebox = async function (app) {
  app.get("/session", { onRequest: [app.authorize()] }, (req, res) => {
    res.send(req.user);
  });
};

export default route;
