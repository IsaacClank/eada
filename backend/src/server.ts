import { Router } from "@oak/oak/router";
import { Application } from "@oak/oak/application";
import { Logger } from "./lib/logger.ts";
import { isHttpError } from "jsr:@oak/commons@1/http_errors";
import {
  getBudgetAsOf,
  InvalidBudgetException,
  upsertBudget,
} from "./services/budget.service.ts";
import { Status } from "jsr:@oak/commons@1/status";
import { Chrono } from "./lib/chrono.ts";
import { Context } from "@oak/oak/context";
import { Exception } from "./lib/exception.ts";

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

    if (ex instanceof Exception) {
      code = ex.message;
      details = ex.cause;
      stack = ex.stack;
    }

    if (ex instanceof InvalidBudgetException) {
      status = Status.Conflict;
    }

    res.status = status;
    res.body = {
      error: code,
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
