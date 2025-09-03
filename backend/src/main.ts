import { Config } from "./config.ts";
import { applyDbMigrations } from "./db/migration.ts";
import { server } from "./server.ts";

await applyDbMigrations();
await server.listen({
  port: Deno.env.has(Config.Port) ? Number(Deno.env.get(Config.Port)) : 3760,
});
