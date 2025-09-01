import * as db from "./db.ts";
import { Config } from "./config.ts";
import { server } from "./server.ts";

await db.migrate();
await server.listen({
  port: Deno.env.has(Config.Port) ? Number(Deno.env.get(Config.Port)) : 3760,
});
