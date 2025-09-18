import { Application } from "@oak/oak/application";
import { Logger } from "./lib/logger.ts";
import { isHttpError } from "@oak/common/http_errors";
import { Status } from "@oak/common/status";
import { ContractViolationException } from "./lib/contract.ts";

import * as commonApi from "./api/common.api.ts";
import * as budgetApi from "./api/budget.api.ts";

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

    if (ex instanceof ContractViolationException) {
      status = Status.BadRequest;
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
server.use(commonApi.router.routes(), commonApi.router.allowedMethods());
server.use(budgetApi.router.routes(), budgetApi.router.allowedMethods());
