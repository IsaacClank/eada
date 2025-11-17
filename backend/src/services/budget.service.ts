import { Status } from "@oak/common/status";

import { BudgetCategoryRepo } from "@src/db/repo/budget-category.repo.ts";
import {
  BudgetContract,
  ReplaceBudgetCategoryContract,
  UpsertBudgetContract,
} from "@src/contracts.ts";
import { BudgetRepo } from "@src/db/repo/budget.repo.ts";
import { Chrono } from "@src/lib/chrono.ts";
import { Collection } from "@src/lib/collection.ts";
import { ForeignKeyConstraintException } from "@src/db/common.ts";
import { HttpException } from "@src/lib/exception.ts";
import { getDbConnection } from "@src/db/connection.ts";

import { ErrorCode } from "./common.ts";

/**
 * @throws {HttpException<Status.Conflict>} income != expense + utilization + surplus
 */
export function upsertBudget(data: UpsertBudgetContract): BudgetContract {
  if (
    data.expectedExpense
        + data.expectedUtilization
        + data.expectedSurplus != data.expectedIncome
  ) {
    throw new HttpException<Status.Conflict>(
      ErrorCode.InvalidBudgetData,
      "Expected expense, utilization and surplus do not add up to expected income",
    );
  }

  const dbConn = getDbConnection();
  const budgetRepo = new BudgetRepo(dbConn);
  const budgetCategoryRepo = new BudgetCategoryRepo(dbConn);

  const id = data.id ?? crypto.randomUUID();
  budgetRepo.upsert({
    ...data,
    id,
    periodStart: Chrono.from(data.periodStart),
    periodEnd: Chrono.from(data.periodEnd),
  });

  const budget = budgetRepo.getById(id);
  if (budget == null) {
    throw new HttpException<Status.InternalServerError>(
      ErrorCode.UnexpectedError,
      "Budget was created successfully but was not found in the database",
    );
  }

  const budgetTransactionCategories = budgetCategoryRepo.getByBudgetId(
    budget.id,
  );

  return {
    id: budget.id,
    periodStart: budget.periodStart.toString(),
    periodEnd: budget.periodEnd.toString(),
    expectedExpense: budget.expectedExpense,
    expectedIncome: budget.expectedIncome,
    expectedSurplus: budget.expectedSurplus,
    expectedUtilization: budget.expectedUtilization,
    categories: budgetTransactionCategories,
  };
}

/**
 * @throws {HttpException<Status.NotFound>} No active budget found for the given timestamp
 */
export function getBudgetAsOf(asOf: Chrono): BudgetContract {
  const dbConn = getDbConnection();
  const budgetRepo = new BudgetRepo(dbConn);
  const budgetCategoryRepo = new BudgetCategoryRepo(dbConn);

  const budget = budgetRepo.getActiveAsOf(asOf);
  if (budget == null) {
    throw new HttpException<Status.NotFound>(
      ErrorCode.BudgetNotFound,
      "No active budget found for the given datetime",
    );
  }

  const budgetTransactionCategories = budgetCategoryRepo.getByBudgetId(
    budget.id,
  );

  return {
    id: budget.id,
    periodStart: budget.periodStart.toString(),
    periodEnd: budget.periodEnd.toString(),
    expectedExpense: budget.expectedExpense,
    expectedIncome: budget.expectedIncome,
    expectedSurplus: budget.expectedSurplus,
    expectedUtilization: budget.expectedUtilization,
    categories: budgetTransactionCategories,
  };
}

/**
 * @throws {HttpException<Status.BadRequest>} Rates of the same type do not add up to 1
 * @throws {HttpException<Status.BadRequest>} No existing budget could be found with the specified Id
 */
export function replaceTransactionCategories(
  budgetId: string,
  categoriesData: ReplaceBudgetCategoryContract[],
): BudgetContract {
  try {
    const rateSumOfEachTypeIsOne = Collection
      .from(categoriesData)
      .groupBy((c) => c.type).toArray()
      .every((group) => group.reduce((sum, c) => sum + c.rate, 0) === 1);
    if (!rateSumOfEachTypeIsOne) {
      throw new HttpException<Status.BadRequest>(
        ErrorCode.InvalidBudgetCategoryData,
        "Rates of the same type must add up to 1",
      );
    }

    const dbConn = getDbConnection();
    const budgetRepo = new BudgetRepo(dbConn);
    const budgetCategoryRepo = new BudgetCategoryRepo(dbConn);

    budgetCategoryRepo.deleteByBudgetId(budgetId);

    if (categoriesData.length > 0) {
      budgetCategoryRepo.upsertMany(...categoriesData.map((c) => (
        {
          id: c.id ?? crypto.randomUUID(),
          budgetId,
          name: c.name,
          type: c.type,
          rate: c.rate,
        }
      )));
    }

    const budget = budgetRepo.getById(budgetId);
    if (budget == null) {
      throw new HttpException<Status.InternalServerError>(
        ErrorCode.UnexpectedError,
        "Budget not found",
      );
    }
    const categories = budgetCategoryRepo.getByBudgetId(budget.id);

    return {
      id: budget.id,
      periodStart: budget.periodStart.toString(),
      periodEnd: budget.periodEnd.toString(),
      expectedExpense: budget.expectedExpense,
      expectedIncome: budget.expectedIncome,
      expectedSurplus: budget.expectedSurplus,
      expectedUtilization: budget.expectedUtilization,
      categories: categories,
    };
  } catch (error) {
    if (error instanceof ForeignKeyConstraintException) {
      throw new HttpException<Status.NotFound>(
        ErrorCode.InvalidBudgetCategoryData,
        "No existing budget can be found with the given ID",
      );
    }

    throw error;
  }
}
