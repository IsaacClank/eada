import { Budget, PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import * as childProcess from "node:child_process";
import { datetime } from "@lib/datetime";
import { DEFAULT_BUDGET_NAME } from "./const";
import { EntityNotFound, TotalIncomePercentageExceeded } from "./error";
import { CreateTransactionDto } from "./contracts";

export const db = () => new PrismaClient();

export async function upsertBudgetAsync(name: string, income: number) {
  return await db().budget.upsert({
    where: {
      normalizedName: name.normalize(),
    },
    update: {
      income,
    },
    create: {
      name,
      normalizedName: name.normalize(),
      income,
    },
  });
}

export async function getDefaultBudgetAsync() {
  return await getBudgetByNameAsync(DEFAULT_BUDGET_NAME.normalize());
}

export async function getBudgetByNameAsync(normalizedName: string) {
  return db().budget.findUnique({
    where: {
      normalizedName: normalizedName.normalize(),
    },
  });
}

export async function createCategoriesForBudgetAsync(
  id: string,
  categories: { name: string; percentageOfIncome: number }[],
) {
  const totalPercentageOfIncome = categories.reduce(
    (sum, category) => sum + category.percentageOfIncome,
    0,
  );

  if (totalPercentageOfIncome > 100) {
    throw new TotalIncomePercentageExceeded();
  }

  const budget = await db().budget.findFirst({ where: { id } });
  if (budget == null) {
    throw new EntityNotFound(`Budget with id (${id}) not found`);
  }

  await db().$transaction([
    ...categories.map((c) =>
      db().budgetCategory.create({
        data: {
          percentageOfIncome: c.percentageOfIncome,
          budget: {
            connect: {
              id: budget.id,
            },
          },
          tag: {
            create: {
              name: `category/${c.name}`,
              normalizedName: `category/${c.name}`.normalize(),
            },
          },
        },
      }),
    ),
  ]);
}

export async function createTransactionsAsync(
  transactions: CreateTransactionDto[],
) {
  await db().$transaction(
    transactions.map(({ createdAt, type, amount, notes, tags }) =>
      db().transaction.create({
        data: {
          createdAt,
          type,
          amount,
          notes,
          tags: {
            connectOrCreate: tags.map((name) => ({
              where: {
                normalizedName: name.normalize(),
              },
              create: {
                name,
                normalizedName: name.normalize(),
              },
            })),
          },
        },
      }),
    ),
  );
}

export namespace vitest {
  if (import.meta.vitest) {
    async function truncateDb() {
      await db().$transaction([
        db().transaction.deleteMany(),
        db().budgetCategory.deleteMany(),
        db().tag.deleteMany(),
        db().budget.deleteMany(),
      ]);
    }

    beforeAll(() => {
      childProcess.execSync(
        "npx dotenv -e .env.test -- npx prisma migrate reset --force",
      );
    });

    describe("upsertBudgetAsync()", () => {
      test("creates a new entry", async () => {
        const expectedName = DEFAULT_BUDGET_NAME;
        const expectedIncome = 40000000;

        await upsertBudgetAsync(expectedName, expectedIncome);

        const actual = await db().budget.findUnique({
          where: { normalizedName: expectedName.normalize() },
        });
        expect(actual).not.null;
        expect(actual?.name).toBe(expectedName);
        expect(actual?.income.toNumber()).toBe(expectedIncome);
      });

      test("updates an existing entry", async () => {
        const expectedName = DEFAULT_BUDGET_NAME;
        const expectedIncome = 50000000;

        await upsertBudgetAsync(expectedName, expectedIncome);

        const actual = await db().budget.findUnique({
          where: { normalizedName: expectedName.normalize() },
        });
        expect(actual).not.null;
        expect(actual?.name).toBe(expectedName);
        expect(actual?.income.toNumber()).toBe(expectedIncome);
      });

      afterAll(() => truncateDb());
    });

    describe("getDefaultBudgetAsync()", () => {
      test("returns the default budget", async () => {
        const defaultBudget = await upsertBudgetAsync(
          DEFAULT_BUDGET_NAME,
          40000000,
        );
        const actual = await getDefaultBudgetAsync();
        expect(actual?.id).toBe(defaultBudget.id);
      });

      afterAll(() => truncateDb());
    });

    describe("getBudgetByNameAsync()", () => {
      test("returns null if not found", async () => {
        const actual = await getDefaultBudgetAsync();
        expect(actual).to.be.null;
      });

      test("returns the expected entry", async () => {
        const defaultBudget = await upsertBudgetAsync(
          DEFAULT_BUDGET_NAME,
          40000000,
        );
        const actual = await getDefaultBudgetAsync();
        expect(actual?.id).toBe(defaultBudget.id);
      });

      afterAll(() => truncateDb());
    });

    describe("createCategoriesForBudgetAsync()", () => {
      let defaultBudget: Budget;

      beforeAll(async () => {
        defaultBudget = await upsertBudgetAsync(DEFAULT_BUDGET_NAME, 40000000);
      });

      test("throws if total percentage of income exceeds 100%", async () => {
        await expect(() =>
          createCategoriesForBudgetAsync(defaultBudget.id, [
            { name: "needs", percentageOfIncome: 70 },
            { name: "wants", percentageOfIncome: 70 },
          ]),
        ).rejects.toThrowError(TotalIncomePercentageExceeded);
      });

      test("throws if specified budget does not exist", async () => {
        const expectedInvalidId = "some-random-id";

        await expect(() =>
          createCategoriesForBudgetAsync(expectedInvalidId, [
            { name: "needs", percentageOfIncome: 50 },
            { name: "wants", percentageOfIncome: 30 },
          ]),
        ).rejects.toThrow(EntityNotFound);
      });

      test("creates budget categories and related tags", async () => {
        await createCategoriesForBudgetAsync(defaultBudget.id, [
          { name: "needs", percentageOfIncome: 50 },
          { name: "wants", percentageOfIncome: 30 },
        ]);

        const budget = await db().budget.findUnique({
          where: {
            normalizedName: DEFAULT_BUDGET_NAME,
          },
          include: {
            budgetCategories: {
              include: {
                tag: true,
              },
            },
          },
        });

        expect(budget).to.not.be.null;
        expect(budget?.budgetCategories).toHaveLength(2);
        expect(
          budget?.budgetCategories
            .map((c) => c.tag)
            .find((t) => t.name === "category/needs"),
        ).to.not.be.null;
        expect(
          budget?.budgetCategories
            .map((c) => c.tag)
            .find((t) => t.name === "category/wants"),
        ).to.not.be.null;
      });

      afterAll(() => truncateDb());
    });

    describe("createTransactionsAsync", () => {
      test("creates transactions and related tags", async () => {
        await createTransactionsAsync([
          {
            createdAt: datetime().toDate(),
            amount: 100000,
            notes: "",
            tags: ["the-coffee-house"],
            type: "Expense",
          },
          {
            createdAt: datetime().toDate(),
            amount: 100000,
            notes: "",
            tags: ["the-coffee-house"],
            type: "Expense",
          },
          {
            createdAt: datetime().toDate(),
            amount: 100000,
            notes: "",
            tags: ["lunch"],
            type: "Expense",
          },
        ]);

        const transactions = await db().transaction.findMany({
          include: { tags: true },
        });

        expect(transactions).toHaveLength(3);

        const createdTags = transactions.reduce((tags, transaction) => {
          transaction.tags.forEach((tag) => {
            tags.add(tag.normalizedName);
          });
          return tags;
        }, new Set<string>());
        expect(createdTags).toHaveLength(2);
      });

      afterAll(() => truncateDb());
    });
  }
}
