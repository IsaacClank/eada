import { Chrono } from "../../lib/chrono.ts";
import { Dict } from "../../lib/dictionary.ts";
import { StringBuilder } from "../../lib/string.ts";
import { DbRecord, ModelAttributes } from "../common.ts";
import { getDbConnection } from "../connection.ts";
import { Model } from "./model.ts";

export class Transaction extends Model {
  static override Table: string = "transaction";
  static override Attributes: ModelAttributes = new Dict<string, string>([
    ["id", "id"],
    ["timestamp", "timestamp"],
    ["categoryId", "category_id"],
    ["amount", "amount"],
    ["note", "note"],
  ]);

  timestamp: Chrono;
  categoryId: string;
  amount: number;
  note: string;

  constructor(data: Transaction) {
    super(data);
    this.timestamp = data.timestamp;
    this.categoryId = data.categoryId;
    this.amount = data.amount;
    this.note = data.note;
  }

  static override from(data: Transaction) {
    return new Transaction(data);
  }

  static override fromDbRecord(output: DbRecord): Transaction {
    return this.from({
      id: String(output[this.column("id")]),
      timestamp: Chrono.from(output[this.column("timestamp")]),
      categoryId: String(output[this.column("categoryId")]),
      amount: Number(output[this.column("amount")]),
      note: String(output[this.column("note")]),
    });
  }

  static insert(...transactions: Transaction[]): number {
    const sqlBuilder = new StringBuilder()
      .a(`INSERT INTO [${this.Table}] (`)
      .a(`id, timestamp, category_id, amount, note`)
      .a(`)`).n()
      .a("VALUES (?, ?, ?, ?, ?)").n()
      .a(";");

    const statement = getDbConnection().prepare(sqlBuilder.get());
    let changedRecordCount: number = 0;
    transactions.forEach(({ id, timestamp, categoryId, amount, note }) => {
      const { changes } = statement.run(
        id,
        timestamp.unix(),
        categoryId,
        amount,
        note,
      );
      changedRecordCount += Number(changes);
    });
    return changedRecordCount;
  }

  static getByIds(...ids: string[]) {
    return super.getByIdsRaw(...ids).map((record) => this.fromDbRecord(record));
  }
}
