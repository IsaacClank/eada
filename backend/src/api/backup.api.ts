import { Router } from "@oak/oak/router";
import { CsvContext } from "../csv/context.ts";

export const router = new Router();

router.post("/backup/import", async (c) => {
  const files = await c.request.body.formData();

  const budgetCsv = files.get("budget");
  const budgetCsvData = budgetCsv instanceof File
    ? await budgetCsv.text()
    : null;

  const budgetCategoryCsv = files.get("budget-category");
  const budgetCategoryCsvData = budgetCategoryCsv instanceof File
    ? await budgetCategoryCsv.text()
    : null;

  const transactionCsv = files.get("transaction");
  const transactionDataCsv = transactionCsv instanceof File
    ? await transactionCsv.text()
    : null;

  const csvContext = new CsvContext(
    budgetCsvData,
    budgetCategoryCsvData,
    transactionDataCsv,
  );

  // TODO: migrate CSV data into database
  // TODO: hook CSV errors into global error handler

  c.response.body = "";
});
