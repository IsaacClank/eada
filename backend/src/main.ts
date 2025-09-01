import { route } from "@std/http/unstable-route";
import * as db from "./db.ts";
import { Config } from "./config.ts";

await db.migrate();

Deno.serve(
  {
    port: Deno.env.has(Config.Port) ? Number(Deno.env.get(Config.Port)) : 3760,
  },
  route(
    // Routings
    [
      {
        pattern: new URLPattern({ pathname: "/health" }),
        handler: () => new Response("", { status: 200 }),
      },
    ],
    // Default handler
    (_req) => {
      return new Response("Not Found", { status: 404 });
    },
  ),
);
