import dayjs from "dayjs";
import fp from "fastify-plugin";

export default fp(async fastify => {
  dayjs.extend(require("dayjs/plugin/utc"));
  fastify.decorate("dayjs", dayjs);
});
