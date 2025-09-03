import { afterEach, describe, it } from "@std/testing/bdd";
import { assertSpyCalls, spy, Stub, stub } from "@std/testing/mock";

import { BudgetDao } from "../db/dao/budget.ts";
import { Budget } from "../db/entities.ts";

import { UpsertBudget, upsertBudget } from "./budget.service.ts";
import { assertNotEquals } from "@std/assert";

describe("upsertBudget()", () => {
  describe("should call BudgetDao.upsert", () => {
    let daoStub: Stub<BudgetDao, [data: Budget], Budget>;

    afterEach(() => {
      if (daoStub != null) {
        daoStub.restore();
      }
    });

    it("with given id if specified", () => {
      daoStub = stub(
        BudgetDao.prototype,
        "upsert",
        spy((data) => data),
      );
      const budgetData: UpsertBudget = {
        id: crypto.randomUUID(),
        periodStart: "2025-01-01T07:00:00+0700",
        periodEnd: "2025-02-01T07:00:00+0700",
        expectedIncome: 100,
        expectedExpense: 50,
        expectedUtilization: 30,
        expectedSurplus: 20,
      };
      upsertBudget(budgetData);
      assertSpyCalls(daoStub, 1);
    });

    it("with generated id if none was specified", () => {
      let generatedId = "";
      daoStub = stub(
        BudgetDao.prototype,
        "upsert",
        spy((data) => {
          generatedId = data.id;
          return data;
        }),
      );
      const budgetData: UpsertBudget = {
        periodStart: "2025-01-01T07:00:00+0700",
        periodEnd: "2025-02-01T07:00:00+0700",
        expectedIncome: 100,
        expectedExpense: 50,
        expectedUtilization: 30,
        expectedSurplus: 20,
      };
      upsertBudget(budgetData);
      assertSpyCalls(daoStub, 1);
      assertNotEquals(generatedId, "");
    });
  });
});
