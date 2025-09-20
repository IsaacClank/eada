import { Status } from "@oak/common/status";
import { Chrono } from "../lib/chrono.ts";
import { HttpException } from "../lib/exception.ts";
import { Budget } from "../db/models/budget.model.ts";
import { TransactionCategory } from "../db/models/transaction-category.model.ts";
import { ForeignKeyConstraintException } from "../db/common.ts";
import {
  BudgetContract,
  ReplaceTransactionCategoryContract,
  UpsertBudgetContract,
} from "../contracts.ts";
import { Collection } from "../lib/collection.ts";

enum ErrorCode {
  InvalidBudgetState = "InvalidBudgetState",
  BudgetNotFound = "BudgetNotFound",
  InvalidTransactionCategoriesState = "InvalidTransactionCategoriesState",
}

/**
 * @throw HttpException<Status.Conflict>
 */
export function upsertBudget(data: UpsertBudgetContract): BudgetContract {
  if (
    data.expectedExpense
        + data.expectedUtilization
        + data.expectedSurplus != data.expectedIncome
  ) {
    throw new HttpException<Status.Conflict>(
      ErrorCode.InvalidBudgetState.toString(),
      "Expected expense, utilization and surplus do not add up to expected income",
    );
  }

  const budget = Budget.upsert({
    ...data,
    id: data.id ?? crypto.randomUUID(),
    periodStart: Chrono.from(data.periodStart),
    periodEnd: Chrono.from(data.periodEnd),
  })[0];
  const budgetTransactionCategories = TransactionCategory.getByBudgetId(
    budget.id,
  );

  return {
    ...budget,
    periodStart: budget.periodStart.toString(),
    periodEnd: budget.periodEnd.toString(),
    categories: budgetTransactionCategories.map(({ name, type, rate }) => ({
      name,
      type,
      rate,
    })),
  };
}

/**
 * @throw HttpException<Status.NotFound>
 */
export function getBudgetAsOf(asOf: Chrono): BudgetContract {
  const budgets = Budget.getActiveAsOf(asOf);
  if (budgets.length === 0) {
    throw new HttpException<Status.NotFound>(
      ErrorCode.BudgetNotFound.toString(),
      "No active budget found for the given datetime",
    );
  }

  const budget = budgets[0];
  const budgetTransactionCategories = TransactionCategory.getByBudgetId(
    budget.id,
  );

  return {
    ...budget,
    periodStart: budget.periodStart.toString(),
    periodEnd: budget.periodEnd.toString(),
    categories: budgetTransactionCategories.map(({ name, type, rate }) => ({
      name,
      type,
      rate,
    })),
  };
}

/**
 * @throw HttpException<Status.BadRequest>
 */
export function replaceTransactionCategories(
  budgetId: string,
  categoriesData: ReplaceTransactionCategoryContract[],
): BudgetContract {
  try {
    const rateSumOfEachTypeIsOne = Collection
      .from(categoriesData)
      .groupBy((c) => c.type).toArray()
      .every((group) => group.reduce((sum, c) => sum + c.rate, 0) === 1);
    if (!rateSumOfEachTypeIsOne) {
      throw new HttpException<Status.BadRequest>(
        ErrorCode.InvalidTransactionCategoriesState,
        "Rates of the same type must add up to 1",
      );
    }

    TransactionCategory.deleteByBudgetId(budgetId);

    const categories = categoriesData.length
      ? TransactionCategory.upsert(...categoriesData.map((c) => (
        {
          id: crypto.randomUUID(),
          budgetId,
          name: c.name,
          type: c.type,
          rate: c.rate,
        }
      )))
      : [];
    const budget = Budget.getByIds(budgetId)[0];

    return {
      ...budget,
      periodStart: budget.periodStart.toString(),
      periodEnd: budget.periodEnd.toString(),
      categories: categories.map(({ name, type, rate }) => ({
        name,
        type,
        rate,
      })),
    };
  } catch (error) {
    if (error instanceof ForeignKeyConstraintException) {
      throw new HttpException<Status.BadRequest>(
        ErrorCode.InvalidTransactionCategoriesState,
        "No existing budget can be found with the given ID",
      );
    }

    throw error;
  }
}
