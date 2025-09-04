import { SQLOutputValue } from "node:sqlite";
import { Chrono } from "../../lib/chrono.ts";
import { Dict } from "../../lib/dictionary.ts";
import { getDbConnection } from "../connection.ts";
import { Budget } from "../entities.ts";

export class RecordNotFoundException extends Error {
  constructor(cause?: string) {
    super("RecordNotFound", { cause });
  }
}

const TABLE_NAME = "budget";
const ATTRIBUTE_TO_COLUMN = new Dict<string, string>([
  ["id", "id"],
  ["periodStart", "period_start"],
  ["periodEnd", "period_end"],
  ["expectedIncome", "expected_income"],
  ["expectedExpense", "expected_expense"],
  ["expectedUtilization", "expected_utilization"],
  ["expectedSurplus", "expected_surplus"],
]);

export class BudgetDao {
  upsert(data: Budget): Budget {
    const db = getDbConnection();
    const insert = db.prepare(`
      INSERT INTO ${TABLE_NAME}
        (
          id, period_start, period_end,
          expected_income, expected_expense,
          expected_utilization, expected_surplus
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        period_start = excluded.period_start,
        period_end = excluded.period_end,
        expected_income = excluded.expected_income,
        expected_expense = excluded.expected_expense,
        expected_utilization = excluded.expected_utilization,
        expected_surplus = excluded.expected_surplus
    `);

    insert.run(
      data.id,
      data.periodStart.unix(),
      data.periodEnd.unix(),
      data.expectedIncome,
      data.expectedExpense,
      data.expectedUtilization,
      data.expectedSurplus,
    );

    return this.getById(data.id);
  }

  /**
   * @throw RecordNotFoundException
   */
  getById(id: string): Budget {
    const result = getDbConnection()
      .prepare(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`)
      .get(id);

    if (result == null) {
      throw new RecordNotFoundException(
        "A record with the given id could not be found",
      );
    }

    return this.createEntityFromDbOutput(result);
  }

  getByPeriodAsOf(asOf: Chrono): Budget | null {
    const result = getDbConnection()
      .prepare(
        `
        SELECT *
        FROM ${TABLE_NAME}
        WHERE period_start <= ? AND ? < period_end
      `,
      )
      .get(asOf.unix(), asOf.unix());

    return result ? this.createEntityFromDbOutput(result) : null;
  }

  private createEntityFromDbOutput(
    output: Record<string, SQLOutputValue>,
  ): Budget {
    return {
      id: String(output[ATTRIBUTE_TO_COLUMN.getValue("id")]),

      periodStart: Chrono.fromUnix(
        Number(output[ATTRIBUTE_TO_COLUMN.getValue("periodStart")]),
      ),
      periodEnd: Chrono.fromUnix(
        Number(output[ATTRIBUTE_TO_COLUMN.getValue("periodEnd")]),
      ),

      expectedIncome: Number(
        output[ATTRIBUTE_TO_COLUMN.getValue("expectedIncome")],
      ),
      expectedExpense: Number(
        output[ATTRIBUTE_TO_COLUMN.getValue("expectedExpense")],
      ),
      expectedUtilization: Number(
        output[ATTRIBUTE_TO_COLUMN.getValue("expectedUtilization")],
      ),
      expectedSurplus: Number(
        output[ATTRIBUTE_TO_COLUMN.getValue("expectedSurplus")],
      ),
    };
  }
}
