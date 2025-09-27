import { DatabaseSync, SQLOutputValue } from "node:sqlite";
import { Config } from "../config.ts";

export type DbRecord = Record<string, SQLOutputValue>;

export interface Repository {
  readonly table: string;
  readonly conn: DatabaseSync;
}

export class RecordNotFoundException extends Error {
  constructor(cause?: string) {
    super("RecordNotFound", { cause });
  }
}

export class ForeignKeyConstraintException extends Error {
  constructor(cause?: string) {
    super("ForeignKeyConstraint", { cause });
  }
}

/**
 * Used for cleaning up test database.
 */
export async function cleanUpDbAsync() {
  const rawDbPath = Deno.env.get(Config.DbPath)!;
  const parsedDbPath = rawDbPath.replaceAll("~", Deno.env.get("HOME")!);
  await Deno.remove(parsedDbPath);
}
