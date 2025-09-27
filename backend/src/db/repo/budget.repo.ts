import { DatabaseSync } from "node:sqlite";
import { Chrono } from "../../lib/chrono.ts";
import { StringBuilder } from "../../lib/string.ts";
import { BudgetData } from "../../models/budget.model.ts";
import { IEqual } from "../../lib/common.ts";
import { DbRecord, Repository } from "../common.ts";

export class BudgetRepo implements Repository {
  private static readonly Table = "budget";
  readonly conn: DatabaseSync;

  get table() {
    return BudgetRepo.Table;
  }

  constructor(conn: DatabaseSync) {
    this.conn = conn;
  }

  upsert(budget: BudgetData) {
    const sqlBuilder = new StringBuilder()
      .a(`INSERT INTO ${this.table} (`).n()
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

    this.conn
      .prepare(sqlBuilder.get())
      .run(
        budget.id,
        budget.periodStart.unix(),
        budget.periodEnd.unix(),
        budget.expectedIncome,
        budget.expectedExpense,
        budget.expectedUtilization,
        budget.expectedSurplus,
      );
  }

  getById(id: string): BudgetDbRecord | null {
    const sqlBuilder = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM [${this.table}]`).n()
      .a(`WHERE id = ?`);
    const record = this.conn
      .prepare(sqlBuilder.get())
      .get(id);
    return record ? new BudgetDbRecord(record) : null;
  }

  getActiveAsOf(asOf: Chrono): BudgetDbRecord | null {
    const sqlBuilder = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM [${this.table}]`).n()
      .a(`WHERE [${this.table}].period_start <= ?`).n()
      .s(2).a(`AND ? < [${this.table}].period_end`).n()
      .a(";");
    const record = this.conn
      .prepare(sqlBuilder.get())
      .get(asOf.unix(), asOf.unix());
    return record ? new BudgetDbRecord(record) : null;
  }
}

/**
 * Facade of DbRecord for accessing Budget fields
 * @see DbRecord
 */
export class BudgetDbRecord implements BudgetData, IEqual<BudgetData> {
  record: DbRecord;

  get id() {
    return String(this.record["id"]);
  }
  set id(value: string) {
    this.record["id"] = value;
  }

  get periodStart() {
    return Chrono.from(Number(this.record["period_start"]));
  }
  set periodStart(value: Chrono) {
    this.record["period_start"] = value.unix();
  }

  get periodEnd() {
    return Chrono.from(Number(this.record["period_end"]));
  }
  set periodEnd(value: Chrono) {
    this.record["period_end"] = value.unix();
  }

  get expectedIncome() {
    return Number(this.record["expected_income"]);
  }
  set expectedIncome(value: number) {
    this.record["expected_income"] = value;
  }

  get expectedExpense() {
    return Number(this.record["expected_expense"]);
  }
  set expectedExpense(value: number) {
    this.record["expected_expense"] = value;
  }

  get expectedUtilization() {
    return Number(this.record["expected_utilization"]);
  }
  set expectedUtilization(value: number) {
    this.record["expected_utilization"] = value;
  }

  get expectedSurplus() {
    return Number(this.record["expected_surplus"]);
  }
  set expectedSurplus(value: number) {
    this.record["expected_surplus"] = value;
  }

  constructor(record: DbRecord) {
    this.record = record;
  }

  equal(other: BudgetData): boolean {
    return this.id === other.id
      && this.periodStart.equal(other.periodStart)
      && this.periodEnd.equal(other.periodEnd)
      && this.expectedIncome === other.expectedIncome
      && this.expectedExpense === other.expectedExpense
      && this.expectedUtilization === other.expectedUtilization
      && this.expectedSurplus === other.expectedSurplus;
  }
}
