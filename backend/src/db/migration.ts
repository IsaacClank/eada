import { getDbConnection } from "./connection.ts";

export async function applyDbMigrations() {
  const db = getDbConnection();
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
