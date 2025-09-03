import { Router } from "@oak/oak/router";
import { Application } from "@oak/oak/application";
import { Logger } from "./lib/logger.ts";
import { isHttpError } from "jsr:@oak/commons@1/http_errors";
import { upsertBudget } from "./services/budget.service.ts";

export const server = new Application();

// Logger
server.use(async ({ request: req, response: res }, next) => {
  Logger.log(`${req.method} ${req.url.pathname}`);
  await next();
  Logger.log(`${req.method} ${req.url.pathname} (${res.status})`);
});

// Error handler
server.use(async ({ response: res }, next) => {
  try {
    await next();
  } catch (ex) {
    if (isHttpError(ex)) {
      res.status = ex.status;
      res.body = {
        error: ex.message,
        details: ex.cause,
        stacktrace: ex.stack,
      };
    } else {
      res.status = 500;
      res.body = {
        error: "UnexpectedError",
        details: ex,
      };
    }
  }
});

// Routes
const router = new Router();

router.get("/health", ({ response: res }) => (res.status = 200));
router.post("/budget", async (ctx) => {
  const { request: req, response: res } = ctx;
  const reqBody = await req.body.json();
  res.body = upsertBudget(reqBody);
});

server.use(router.routes());
server.use(router.allowedMethods());
