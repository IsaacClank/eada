import { Router } from "@oak/oak/router";
import { Chrono } from "../lib/chrono.ts";
import {
  getBudgetAsOf,
  replaceTransactionCategories,
  upsertBudget,
} from "../services/budget.service.ts";
import {
  CreateTransactionContract,
  ReplaceBudgetCategoryContract,
  UpsertBudgetContract,
} from "../contracts.ts";
import { createTransactions } from "../services/transaction.service.ts";

export const router = new Router();

router.post("/budget", async (c) => {
  const data = await c.request.body.json().then(UpsertBudgetContract.parse);
  c.response.body = upsertBudget(data);
});

router.get("/budget", (c) => {
  const parsedAsOf = c.request.url.searchParams.get("asOf");
  c.response.body = getBudgetAsOf(Chrono.from(parsedAsOf));
});

router.put("/budget/:budgetId/category", async (c) => {
  const budgetId = c.params.budgetId;
  const data = ReplaceBudgetCategoryContract
    .array()
    .parse(await c.request.body.json());
  c.response.body = replaceTransactionCategories(budgetId, data);
});

router.post("/budget/:budgetId/transaction", async (c) => {
  const budgetId = c.params.budgetId;
  const data = CreateTransactionContract
    .array()
    .parse(await c.request.body.json());
  c.response.body = createTransactions(budgetId, data);
});
