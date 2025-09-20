import { Dict } from "../../lib/dictionary.ts";
import { StringBuilder } from "../../lib/string.ts";
import { getDbConnection } from "../connection.ts";
import { Model } from "./model.ts";
import { DbRecord, ForeignKeyConstraintException } from "../common.ts";

type TransactionType = "Income" | "Expense" | "Utilization";

export class TransactionCategory extends Model {
  static override readonly Table = "transaction_category";
  static override readonly Attributes = new Dict<string, string>([
    ["id", "id"],
    ["budgetId", "budget_id"],
    ["name", "name"],
    ["type", "type"],
    ["rate", "rate"],
  ]);

  budgetId: string;
  name: string;
  type: TransactionType;
  rate: number;

  protected constructor(data: TransactionCategory) {
    super(data);
    this.budgetId = data.budgetId;
    this.name = data.name;
    this.type = data.type;
    this.rate = data.rate;
  }

  static override from(data: TransactionCategory) {
    return new TransactionCategory(data);
  }

  static override fromDbRecord(output: DbRecord) {
    return this.from({
      id: String(output[this.column("id")]),
      budgetId: String(output[this.column("budgetId")]),
      name: String(output[this.column("name")]),
      type: String(output[this.column("type")]) as TransactionType,
      rate: Number(output[this.column("rate")]),
    });
  }

  /**
   * @throw ForeignKeyConstraintException
   */
  static upsert(...categories: TransactionCategory[]): TransactionCategory[] {
    try {
      const queryBuilder = new StringBuilder()
        .a(`INSERT INTO ${this.Table} (id, budget_id, name, type, rate)`).n()
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

      const statement = getDbConnection().prepare(queryBuilder.get());
      categories.forEach((data) => {
        statement.run(
          data.id,
          data.budgetId,
          data.name,
          data.type.toString(),
          data.rate,
        );
      });

      return this.getByIds(...categories.map((c) => c.id));
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

  static getByIds(...ids: string[]): TransactionCategory[] {
    return super.getByIdsRaw(...ids).map((record) => this.fromDbRecord(record));
  }

  static getByBudgetId(budgetId: string): TransactionCategory[] {
    const sqlBuilder = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM ${this.Table}`).n()
      .a(`WHERE ${this.Table}.budget_id = ?`).n()
      .a(";");
    return getDbConnection()
      .prepare(sqlBuilder.get())
      .all(budgetId)
      .map((record) => this.fromDbRecord(record));
  }

  static deleteByBudgetId(budgetId: string): void {
    getDbConnection().exec(
      `DELETE FROM ${this.Table} WHERE ${this.Table}.budget_id = '${budgetId}'`,
    );
  }
}
