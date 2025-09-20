import { Chrono } from "../../lib/chrono.ts";
import { Dict } from "../../lib/dictionary.ts";
import { StringBuilder } from "../../lib/string.ts";
import { DbRecord } from "../common.ts";
import { getDbConnection } from "../connection.ts";
import { Model } from "./model.ts";

export class Budget extends Model {
  static override readonly Table: string = "budget";
  static override readonly Attributes = new Dict<string, string>([
    ["id", "id"],
    ["periodStart", "period_start"],
    ["periodEnd", "period_end"],
    ["expectedIncome", "expected_income"],
    ["expectedExpense", "expected_expense"],
    ["expectedUtilization", "expected_utilization"],
    ["expectedSurplus", "expected_surplus"],
  ]);

  periodStart: Chrono;
  periodEnd: Chrono;
  expectedIncome: number;
  expectedExpense: number;
  expectedUtilization: number;
  expectedSurplus: number;

  protected constructor(data: Budget) {
    super(data);
    this.periodStart = data.periodStart;
    this.periodEnd = data.periodEnd;
    this.expectedIncome = data.expectedIncome;
    this.expectedExpense = data.expectedExpense;
    this.expectedUtilization = data.expectedUtilization;
    this.expectedSurplus = data.expectedSurplus;
  }

  static override from(data: Budget): Budget {
    return new Budget(data);
  }

  static override fromDbRecord(output: DbRecord): Budget {
    return this.from({
      id: String(output[this.column("id")]),
      periodStart: Chrono.from(output[this.column("periodStart")]),
      periodEnd: Chrono.from(output[this.column("periodEnd")]),
      expectedIncome: Number(output[this.column("expectedIncome")]),
      expectedExpense: Number(output[this.column("expectedExpense")]),
      expectedUtilization: Number(output[this.column("expectedUtilization")]),
      expectedSurplus: Number(output[this.column("expectedSurplus")]),
    });
  }

  static upsert(...budgets: Budget[]) {
    const sqlBuilder = new StringBuilder()
      .a(`INSERT INTO ${this.Table} (`).n()
      .s(2).a("id, period_start, period_end,").n()
      .s(2).a("expected_income, expected_expense,").n()
      .s(2).a("expected_utilization, expected_surplus").n()
      .a(")").n()
      .a("VALUES (?, ?, ?, ?, ?, ?, ?)").n()
      .a("ON CONFLICT(id) DO UPDATE SET").n()
      .s(2).a("period_start = excluded.period_start,").n()
      .s(2).a("period_end = excluded.period_end,").n()
      .s(2).a("expected_income = excluded.expected_income,").n()
      .s(2).a("expected_expense = excluded.expected_expense,").n()
      .s(2).a("expected_utilization = excluded.expected_utilization,").n()
      .s(2).a("expected_surplus = excluded.expected_surplus").n()
      .a(";");

    const statement = getDbConnection().prepare(sqlBuilder.get());

    budgets.forEach((budget) => {
      statement.run(
        budget.id,
        budget.periodStart.unix(),
        budget.periodEnd.unix(),
        budget.expectedIncome,
        budget.expectedExpense,
        budget.expectedUtilization,
        budget.expectedSurplus,
      );
    });

    return this.getByIds(...budgets.map((b) => b.id));
  }

  static getByIds(...ids: string[]) {
    return super.getByIdsRaw(...ids).map((record) => this.fromDbRecord(record));
  }

  static getActiveAsOf(asOf: Chrono) {
    const sqlBuilder = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM ${this.Table}`).n()
      .a(`WHERE ${this.Table}.period_start <= ?`).n()
      .s(2).a(`AND ? < ${this.Table}.period_end`).n()
      .a(";");

    return getDbConnection()
      .prepare(sqlBuilder.get())
      .all(asOf.unix(), asOf.unix())
      .map((r) => this.fromDbRecord(r));
  }
}
