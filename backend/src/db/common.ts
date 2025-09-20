import { SQLOutputValue } from "node:sqlite";
import { Dict } from "../lib/dictionary.ts";
import { Config } from "../config.ts";

export type DbRecord = Record<string, SQLOutputValue>;
export type ModelAttributes = Dict<string, string>;

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

export async function cleanUpDbAsync() {
  const rawDbPath = Deno.env.get(Config.DbPath)!;
  const parsedDbPath = rawDbPath.replaceAll("~", Deno.env.get("HOME")!);
  await Deno.remove(parsedDbPath);
}
