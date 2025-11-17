import { DatabaseSync, SQLOutputValue } from "node:sqlite";

import { ForeignKeyConstraintException, Repository } from "@src/db/common.ts";
import { IEqual } from "@src/lib/common.ts";
import { StringBuilder } from "@src/lib/string.ts";
import {
  BudgetCategoryData,
  TransactionType,
} from "@src/models/budget-category.model.ts";

export class BudgetCategoryRepo implements Repository {
  private static readonly Table: string = "budget_category";
  readonly conn: DatabaseSync;

  get table() {
    return BudgetCategoryRepo.Table;
  }

  constructor(conn: DatabaseSync) {
    this.conn = conn;
  }

  /**
   * @throw ForeignKeyConstraintException
   */
  upsertMany(...categories: BudgetCategoryData[]) {
    try {
      const queryBuilder = new StringBuilder()
        .a(`INSERT INTO ${this.table} (id, budget_id, name, type, rate)`).n()
        .a("VALUES (?, ?, ?, ?, ?)").n()
        .a(
          new StringBuilder()
            .a("ON CONFLICT(budget_id, name) DO UPDATE SET").n()
            .s(2).a("id = excluded.id,").n()
            .s(2).a("type = excluded.type,").n()
            .s(2).a("rate = excluded.rate").n()
            .get(),
        )
        .a(";");

      const statement = this.conn.prepare(queryBuilder.get());
      let changedRecordCount = 0;
      categories.forEach((data) => {
        const { changes } = statement.run(
          data.id,
          data.budgetId,
          data.name,
          data.type.toString(),
          data.rate,
        );
        changedRecordCount += Number(changes);
      });
      return changedRecordCount;
    } catch (error) {
      if (
        error instanceof Error
        && error.message === "FOREIGN KEY constraint failed"
      ) {
        throw new ForeignKeyConstraintException(
          "Attempted to create transaction categories for a non-existent budget",
        );
      }

      throw error;
    }
  }

  getAll(): BudgetCategoryDbRecord[] {
    const sqlBuilder = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM [${this.table}]`).n()
      .a(";");
    return this.conn
      .prepare(sqlBuilder.get())
      .all()
      .map((record) => new BudgetCategoryDbRecord(record));
  }

  getByBudgetId(budgetId: string): BudgetCategoryDbRecord[] {
    const sqlBuilder = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM [${this.table}]`).n()
      .a(`WHERE [${this.table}].budget_id = ?`).n()
      .a(";");
    return this.conn
      .prepare(sqlBuilder.get())
      .all(budgetId)
      .map((record) => new BudgetCategoryDbRecord(record));
  }

  deleteByBudgetId(budgetId: string): number {
    const statement = this.conn.prepare(
      `DELETE FROM [${this.table}] WHERE [${this.table}].budget_id = ?`,
    );
    return Number(statement.run(budgetId).changes);
  }
}

export class BudgetCategoryDbRecord
  implements BudgetCategoryData, IEqual<BudgetCategoryData> {
  private record: Record<string, SQLOutputValue>;

  get id() {
    return String(this.record["id"]);
  }
  set id(value: string) {
    this.record["id"] = value;
  }

  get budgetId() {
    return String(this.record["budget_id"]);
  }
  set budgetId(value: string) {
    this.record["budget_id"] = value;
  }

  get name() {
    return String(this.record["name"]);
  }
  set name(value: string) {
    this.record["name"] = value;
  }

  get type() {
    return String(this.record["type"]) as TransactionType;
  }
  set type(value: TransactionType) {
    this.record["type"] = value;
  }

  get rate() {
    return Number(this.record["rate"]);
  }
  set rate(value: number) {
    this.record["rate"] = value;
  }

  constructor(record: Record<string, SQLOutputValue>) {
    this.record = record;
  }

  equal(other: BudgetCategoryData): boolean {
    return this.id === other.id
      && this.budgetId === other.budgetId
      && this.name === other.name
      && this.type === other.type
      && this.rate === other.rate;
  }

  data(): BudgetCategoryData {
    return {
      id: this.id,
      budgetId: this.budgetId,
      name: this.name,
      type: this.type,
      rate: this.rate,
    };
  }
}
