import { afterAll, afterEach, beforeAll, describe, it } from "@std/testing/bdd";
import { getDbConnection } from "./connection.ts";
import { assert, assertExists } from "@std/assert";
import { SpyLike, stub } from "@std/testing/mock";
import { Config } from "../config.ts";
import { cleanUpDbAsync } from "./common.ts";

describe("db.connection", () => {
  describe("getDbConnection", () => {
    describe(`when ${Config.DbPath} is not set`, () => {
      const spies: SpyLike[] = [];
      beforeAll(() => {
        spies.push(stub(Deno.env, "has", (_) => false));
      });

      afterAll(() => {
        spies.forEach((spy) => spy.restore());
      });

      it("should initialize an in-memory database", () => {
        assertExists(getDbConnection());
      });
    });

    describe(`when ${Config.DbPath} is set`, () => {
      afterEach(async () => {
        await cleanUpDbAsync();
      });

      it("should initialize a database at the location defined by DB_PATH", async () => {
        assertExists(getDbConnection());
        const actualPathToDbFile = await Deno.stat(
          Deno.env.get(Config.DbPath)!,
        );
        assert(actualPathToDbFile.isFile);
      });
    });
  });
});
