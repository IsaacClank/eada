import { Router } from "@oak/oak/router";
import { Application } from "@oak/oak/application";
import { Logger } from "./lib/logger.ts";
import { isHttpError } from "@oak/common/http_errors";
import { getBudgetAsOf, upsertBudget } from "./services/budget.service.ts";
import { Status } from "@oak/common/status";
import { Chrono } from "./lib/chrono.ts";
import { Context } from "@oak/oak/context";

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
    let status = Status.InternalServerError;
    let code = null;
    let details = null;
    let stack = null;

    if (isHttpError(ex)) {
      status = ex.status;
      code = ex.message;
      details = ex.cause;
      stack = ex.stack;
    }

    res.status = status;
    res.body = {
      code,
      details,
      stack,
    };
    Logger.err(`${code}: ${details}`);
  }
});

// Routes
const router = new Router();

router.get("/health", ({ response: res }) => (res.status = 200));

router.post("/budget", async (c) => {
  const reqBody = await c.request.body.json();
  c.response.body = upsertBudget(reqBody);
});

router.get("/budget", (c: Context) => {
  const asOfRaw: string | null = c.request.url.searchParams.get("asOf");
  c.assert(asOfRaw != null, Status.BadRequest, "InvalidInput", {
    cause: "missing query parameter asOf",
  });
  c.response.body = getBudgetAsOf(Chrono.from(asOfRaw));
});

server.use(router.routes());
server.use(router.allowedMethods());
