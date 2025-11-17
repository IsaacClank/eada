import { DatabaseSync, SQLOutputValue } from "node:sqlite";

import { DbRecord, Repository } from "@src/db/common.ts";
import { Chrono } from "@src/lib/chrono.ts";
import { IEqual } from "@src/lib/common.ts";
import { StringBuilder } from "@src/lib/string.ts";
import { TransactionData } from "@src/models/transaction.model.ts";

export class TransactionRepo implements Repository {
  private static readonly Table = "transaction";
  readonly conn: DatabaseSync;

  get table() {
    return TransactionRepo.Table;
  }

  constructor(conn: DatabaseSync) {
    this.conn = conn;
  }

  insertMany(...transactions: TransactionData[]) {
    const sqlBuilder = new StringBuilder()
      .a(`INSERT INTO [${this.table}] (`).n()
      .s(2).a(`id, budget_id, timestamp, category, amount, note`)
      .a(")").n()
      .a("VALUES (?, ?, ?, ?, ?, ?)").n()
      .a(";");

    const statement = this.conn.prepare(sqlBuilder.get());
    let changedRecordCount: number = 0;
    transactions.forEach(
      ({ id, budgetId, timestamp, category, amount, note }) => {
        const { changes } = statement.run(
          id,
          budgetId,
          timestamp.unix(),
          category,
          amount,
          note,
        );
        changedRecordCount += Number(changes);
      },
    );
    return changedRecordCount;
  }

  getAll(): TransactionDbRecord[] {
    const sqlBuilder = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM [${this.table}]`).n()
      .a(";");
    return this.conn
      .prepare(sqlBuilder.get())
      .all()
      .map((record) => new TransactionDbRecord(record));
  }

  getByBudgetId(budgetId: string) {
    const sqlBuilder = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM [${this.table}]`).n()
      .a(`WHERE [${this.table}].budget_id = ?`).n()
      .a(";");
    return this.conn
      .prepare(sqlBuilder.get())
      .all(budgetId)
      .map((record) => new TransactionDbRecord(record));
  }
}

export class TransactionDbRecord
  implements TransactionData, IEqual<TransactionData> {
  record: DbRecord;

  get id(): string {
    return String(this.record["id"]);
  }
  set id(value: string) {
    this.record["id"] = value;
  }

  get budgetId(): string {
    return String(this.record["budget_id"]);
  }
  set budgetId(value: string) {
    this.record["budget_id"] = value;
  }

  get timestamp(): Chrono {
    return Chrono.from(Number(this.record["timestamp"]));
  }
  set timestamp(value: Chrono) {
    this.record["timestamp"] = value.unix();
  }

  get category(): string {
    return String(this.record["category"]);
  }
  set category(value: string) {
    this.record["category"] = value;
  }

  get amount(): number {
    return Number(this.record["amount"]);
  }
  set amount(value: number) {
    this.record["amount"] = value;
  }

  get note(): string {
    return String(this.record["note"]);
  }
  set note(value: string) {
    this.record["note"] = value;
  }

  constructor(record: Record<string, SQLOutputValue>) {
    this.record = record;
  }

  equal(other: TransactionData): boolean {
    return this.id === other.id
      && this.budgetId === other.budgetId
      && this.timestamp.equal(other.timestamp)
      && this.category === other.category
      && this.amount === other.amount
      && this.note === other.note;
  }

  data(): TransactionData {
    return {
      id: this.id,
      budgetId: this.budgetId,
      timestamp: this.timestamp,
      category: this.category,
      amount: this.amount,
      note: this.note,
    };
  }
}
