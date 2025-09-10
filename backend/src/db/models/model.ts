import { StringBuilder } from "../../lib/string.ts";
import { DbRecord, ModelAttributes } from "../common.ts";
import { getDbConnection } from "../connection.ts";

export class Model {
  static readonly Table: string;
  static readonly Attributes: ModelAttributes;

  id: string;

  protected constructor(data: Model) {
    this.id = data.id;
  }

  protected static column(attribute: string) {
    return this.Attributes.getValue(attribute);
  }

  static from(_: Model): Model {
    throw new Error("NotImplemented");
  }

  static fromDbRecord(_: DbRecord): Model {
    throw new Error("NotImplemented");
  }

  protected static getByIdsRaw(...ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    const sqlBuilder = new StringBuilder()
      .a("SELECT *").n()
      .a(`FROM ${this.Table}`).n()
      .a(`WHERE id IN (${ids.map((_) => "?").join(",")})`);

    return getDbConnection()
      .prepare(sqlBuilder.get())
      .all(...ids);
  }
}
