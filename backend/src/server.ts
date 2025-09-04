import { Router } from "@oak/oak/router";
import { Application } from "@oak/oak/application";
import { Logger } from "./lib/logger.ts";
import { isHttpError } from "jsr:@oak/commons@1/http_errors";
import {
  InvalidBudgetException,
  upsertBudget,
} from "./services/budget.service.ts";
import { Status } from "jsr:@oak/commons@1/status";

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
    const status = isHttpError(ex) ? ex.status : Status.InternalServerError;
    const code = isHttpError(ex) ? ex.message : null;
    const details = isHttpError(ex) ? ex.cause : null;
    const stack = isHttpError(ex) ? ex.stack : null;

    res.status = status;
    res.body = {
      error: code,
      details,
      stack,
    };
  }
});

// Routes
const router = new Router();

router.get("/health", ({ response: res }) => (res.status = 200));
router.post("/budget", async (c) => {
  try {
    const reqBody = await c.request.body.json();
    c.response.body = upsertBudget(reqBody);
  } catch (ex) {
    Logger.err(ex);
    if (ex instanceof InvalidBudgetException) {
      c.throw(Status.Conflict, ex.message, {
        cause: ex.cause,
        stack: ex.stack,
      });
    }
    c.throw(Status.InternalServerError, "UnexpectedException", {
      cause: ex,
    });
  }
});

server.use(router.routes());
server.use(router.allowedMethods());
