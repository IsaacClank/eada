import { Router } from "@oak/oak/router";
import { Chrono } from "../lib/chrono.ts";
import {
  getBudgetAsOf,
  replaceTransactionCategories,
  upsertBudget,
} from "../services/budget.service.ts";
import { Contract } from "../lib/contract.ts";

export const router = new Router();

router.post("/budget", async (c) => {
  const data = await c.request.body.json();
  c.response.body = upsertBudget({
    id: Contract.from(data.id, "id").toNullableString(),
    periodStart: Contract
      .from(data.periodStart, "periodStart")
      .notNullOrUndefined()
      .toString(),
    periodEnd: Contract
      .from(data.periodEnd, "periodEnd")
      .notNullOrUndefined()
      .toString(),
    expectedIncome: Contract
      .from(data.expectedIncome, "expectedIncome")
      .notNullOrUndefined()
      .toNumber(),
    expectedExpense: Contract
      .from(data.expectedExpense, "expectedExpense")
      .notNullOrUndefined()
      .toNumber(),
    expectedUtilization: Contract
      .from(data.expectedUtilization, "expectedUtilization")
      .notNullOrUndefined()
      .toNumber(),
    expectedSurplus: Contract
      .from(data.expectedSurplus, "expectedSurplus")
      .notNullOrUndefined()
      .toNumber(),
  });
});

router.get("/budget", (c) => {
  const parsedAsOf = Contract
    .from(c.request.url.searchParams.get("asOf"), "asOf")
    .notNullOrUndefined()
    .toString();
  c.response.body = getBudgetAsOf(Chrono.from(parsedAsOf));
});

router.put("/budget/:budgetId/category", async (c) => {
  const budgetId = Contract
    .from(c.params.budgetId, "budgetId")
    .notNullOrUndefined()
    .toString();
  const data = Contract.from(await c.request.body.json(), "body").toArray();
  data.forEach((entry, index) => {
    Contract.from(entry.name, `${index}.name`).notNullOrUndefined().toString();
    Contract.from(entry.type, `${index}.type`).notNullOrUndefined().toString();
    Contract.from(entry.rate, `${index}.rate`).notNullOrUndefined().toString();
  });

  c.response.body = replaceTransactionCategories(budgetId, data);
});
