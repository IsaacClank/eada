import { Application } from "@oak/oak/application";
import { Logger } from "./lib/logger.ts";
import { isHttpError } from "@oak/common/http_errors";
import { Status } from "@oak/common/status";
import { $ZodError, $ZodIssueBase } from "zod/v4/core";

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
    let details = [];
    let stack = null;

    if (isHttpError(ex)) {
      status = ex.status;
      code = ex.message;
      details = [ex.cause];
      stack = ex.stack;
    }

    if (ex instanceof $ZodError) {
      status = Status.BadRequest;
      code = "ContractViolation";
      details = JSON.parse(ex.message).map((msg: $ZodIssueBase) =>
        `${msg.path.join(".")}: ${msg.message.split(": ").slice(1)}`
      );
    }

    res.status = status;
    res.body = {
      code,
      details,
      stack,
    };

    details.forEach((detail: string) => {
      Logger.err(`${code}: ${detail}`);
    });
  }
});

// Routes
server.use(commonApi.router.routes(), commonApi.router.allowedMethods());
server.use(budgetApi.router.routes(), budgetApi.router.allowedMethods());
