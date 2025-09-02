import * as sqlite from "node:sqlite";
import { Config } from "./config.ts";

export function connect() {
  if (!Deno.env.has(Config.DbPath)) {
    return new sqlite.DatabaseSync(":memory:");
  }

  const rawDbPath = Deno.env.get(Config.DbPath)!;
  const parsedDbPath = rawDbPath.replaceAll("~", Deno.env.get("HOME")!);
  const parsedDbPathDir = parsedDbPath.split("/").slice(0, -1).join("/");
  Deno.mkdir(parsedDbPathDir, { recursive: true });
  return new sqlite.DatabaseSync(parsedDbPath);
}

export async function migrate() {
  const db = connect();
  const pathToMigrations = `${Deno.cwd()}/migrations`;

  for await (const migration of Deno.readDir(pathToMigrations)) {
    if (!migration.isDirectory) {
      continue;
    }

    const pathToMigration = `${pathToMigrations}/${migration.name}/up.sql`;
    const migrationScript = await Deno.readTextFile(pathToMigration);
    db.exec(migrationScript);
  }
}
