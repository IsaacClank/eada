import { describe } from "@std/testing/bdd";
import { it } from "node:test";
import { collect, Collection } from "./collection.ts";
import { assertEquals } from "@std/assert";

describe("Collection", () => {
  describe("isEmpty", () => {
    it("should evaluate whether the collection is empty", () => {
      assertEquals(true, collect([]).isEmpty());
      assertEquals(false, collect([1, 2]).isEmpty());
    });
  });

  describe("groupBy", () => {
    it("groupBy", () => {
      const people = [
        { name: "Isaac", age: 26 },
        { name: "Ari", age: 26 },
        { name: "Byte", age: 20 },
      ];

      const peopleGroupedByAge = Collection.from(people).groupBy((person) =>
        person.age
      ).toArray();
      assertEquals(
        peopleGroupedByAge,
        [
          [{ name: "Isaac", age: 26 }, { name: "Ari", age: 26 }],
          [{ name: "Byte", age: 20 }],
        ],
      );
    });
  });
});
