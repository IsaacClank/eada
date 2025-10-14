import { DatabaseSync } from "node:sqlite";
import { Config } from "../config.ts";

export function getDbConnection() {
  if (!Deno.env.has(Config.DbPath)) {
    return new DatabaseSync(":memory:");
  }

  const rawDbPath = Deno.env.get(Config.DbPath)!;
  const parsedDbPath = rawDbPath.replaceAll("~", Deno.env.get("HOME")!);
  const parsedDbPathDir = parsedDbPath.split("/").slice(0, -1).join("/");
  Deno.mkdirSync(parsedDbPathDir, { recursive: true });
  return new DatabaseSync(parsedDbPath);
}
