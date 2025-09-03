import { describe, it } from "node:test";
import { Exception } from "./exception.ts";
import { assertIsError } from "@std/assert";

describe("Exception", () => {
  it("can be instantiated", () => {
    const ex = new Exception("Something unexpected happened");
    assertIsError(ex, Exception);
  });
});
