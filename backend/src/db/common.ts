import { SQLOutputValue } from "node:sqlite";
import { Dict } from "../lib/dictionary.ts";

export type DbRecord = Record<string, SQLOutputValue>;
export type ModelAttributes = Dict<string, string>;

export class RecordNotFoundException extends Error {
  constructor(cause?: string) {
    super("RecordNotFound", { cause });
  }
}
