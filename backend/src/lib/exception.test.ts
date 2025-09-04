import { describe, it } from "node:test";
import { HttpException } from "./exception.ts";
import { assertIsError } from "@std/assert";

describe("Exception", () => {
  it("can be instantiated", () => {
    const ex = new HttpException("Something unexpected happened");
    assertIsError(ex, HttpException);
  });
});
