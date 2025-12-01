import { z } from "zod";
import { createDocument } from "zod-openapi";
import { BudgetContract, UpsertBudgetContract } from "./contracts.ts";

const Error = z.object({
  code: z.string(),
  details: z.string().array().default([]),
  stacktrace: z.string().optional(),
});

const Timestamp = z.iso.date().meta({
  description: "ISO 8061 date",
  example: "2025-01-01",
});

const document = createDocument({
  openapi: "3.1.0",
  info: {
    title: "Eada Daemon API",
    version: "1.0.0",
    license: {
      name: "GNU GPLv3",
      url: "https://www.gnu.org/licenses/gpl-3.0.en.html",
    },
  },
  servers: [
    {
      url: "localhost:3760",
    },
  ],
  tags: [
    {
      name: "general",
    },
    {
      name: "budget",
    },
    {
      name: "transaction",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["general"],
        description: "Healthcheck endpoint.",
        responses: {
          "200": {
            description: "Daemon is ready to accept requests.",
          },
        },
      },
    },
    "/budget": {
      post: {
        description: "Create or update a budget.",
        tags: ["budget"],
        requestBody: {
          content: {
            "application/json": { schema: UpsertBudgetContract },
          },
        },
        responses: {
          "200": {
            description: "A new budget was created successfully.",
            content: {
              "application/json": { schema: BudgetContract },
            },
          },
          "409": {
            description:
              "Expected expense, utilization and suplus do not add up to expected income",
            content: {
              "application/json": { schema: Error },
            },
          },
        },
      },
      get: {
        description: "Get the active budget at a given point in time",
        tags: ["budget"],
        requestParams: {
          query: z.object({
            asOf: Timestamp,
          }),
        },
        responses: {
          "200": {
            description: "An active budget was found.",
            content: { "application/json": { schema: BudgetContract } },
          },
          "404": {
            description: "No active budget found.",
            content: { "application/json": { schema: Error } },
          },
          "500": {
            description: "Unexpected error.",
            content: { "application/json": { schema: Error } },
          },
        },
      },
    },
    // "/budget/{budgetId}/category": {},
    // "/budget/{budgetId}/transaction": {},
  },
});

console.log(JSON.stringify(document));
