import { assertEquals } from "@std/assert";
import { beforeAll, describe, it } from "@std/testing/bdd";
import {
  Chrono,
  ChronoFormat,
  ChronoSpan,
  ChronoSpanFormat,
} from "./chrono.ts";
import assert from "node:assert";

describe("Chrono", () => {
  beforeAll(() => {
    Deno.env.set("TZ", "Asia/Ho_Chi_Minh");
  });

  describe("can be instantiated", () => {
    it("from current datetime", () => {
      const expected = new Date();
      const actual = Chrono.now();
      assert(Math.round(actual.millis() - expected.getTime()) <= 1);
    });

    it("from unix timestamp", () => {
      const timestamp = 1738368000;
      const expected = new Date(timestamp * 1000);
      const actual = Chrono.fromUnix(timestamp);
      assertEquals(actual.millis(), expected.getTime());
    });

    it("from millis timestamp", () => {
      const timestamp = 1738368000123;
      const expected = new Date(timestamp);
      const actual = Chrono.fromMillis(timestamp);
      assertEquals(actual.millis(), expected.getTime());
    });
  });

  describe("unix()", () => {
    it("should return seconds since the unix epoch", () => {
      const now = new Date();
      assertEquals(new Chrono(now).unix(), Math.floor(now.getTime() / 1000));
    });
  });

  describe("unixInMilliseconds()", () => {
    it("should return milliseconds since the unix epoch", () => {
      const now = new Date();
      assertEquals(new Chrono(now).millis(), now.getTime());
    });
  });

  describe("diff()", () => {
    it("should return a ChronoSpan representing the difference between two Chrono instances", () => {
      const now = new Date();

      const oneHundredMillisAgo = new Date(now.getTime() - 100);
      assertEquals(
        Chrono.from(now).diff(Chrono.from(oneHundredMillisAgo)).milliseconds,
        100,
      );

      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      assertEquals(
        Chrono.from(now).diff(Chrono.from(twoMinutesAgo)).minutes,
        2,
      );

      const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
      assertEquals(
        Chrono.from(now).diff(Chrono.from(threeMinutesAgo)).minutes,
        3,
      );

      const anHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      assertEquals(Chrono.from(now).diff(Chrono.from(anHourAgo)).hours, 1);
    });
  });

  describe("startOf() should return a cloned Chrono set to the start of", () => {
    it("the day", () => {
      const datetime = new Date(2025, 1, 1, 7, 0, 0, 0);
      const expected = new Date(
        datetime.getFullYear(),
        datetime.getMonth(),
        datetime.getDate(),
        0,
        0,
        0,
        0,
      );
      const actual = Chrono.from(datetime).startOf("Day");
      assertEquals(actual.millis(), expected.getTime());
    });

    it("the month", () => {
      const datetime = new Date();
      const expected = new Date(
        datetime.getFullYear(),
        datetime.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );
      const actual = Chrono.from(datetime).startOf("Month");
      assertEquals(actual.millis(), expected.getTime());
    });

    it("the year", () => {
      const datetime = new Date();
      const today = new Date(datetime.getFullYear(), 0, 1, 0, 0, 0, 0);
      const actual = Chrono.from(datetime).startOf("Year");
      assertEquals(actual.millis(), today.getTime());
    });
  });

  describe("toString()", () => {
    it("should display datetime using the basic format", () => {
      const now = new Date();
      assertEquals(
        new Chrono(now).toString(ChronoFormat.Basic),
        now.toString(),
      );
    });

    it("should display datetime using ISO 8061 format", () => {
      const now = new Date(2025, 0, 1, 7, 30, 5, 500);
      assertEquals(
        new Chrono(now).toString(ChronoFormat.Iso8061),
        "2025-01-01T07:30:05.500+0700",
      );
    });
  });
});

describe("ChronoSpan", () => {
  describe("fromMilliseconds()", () => {
    it("should instantiate from milliseconds", () => {
      const chronoSpan = ChronoSpan.fromMilliseconds(500);
      assertEquals(chronoSpan.milliseconds, 500);
      assertEquals(chronoSpan.seconds, 0);
      assertEquals(chronoSpan.minutes, 0);
      assertEquals(chronoSpan.hours, 0);
    });
  });

  describe("fromSeconds()", () => {
    it("should instantiate from seconds", () => {
      const chronoSpan = ChronoSpan.fromSeconds(30.5);
      assertEquals(chronoSpan.milliseconds, 30500);
      assertEquals(chronoSpan.seconds, 30);
      assertEquals(chronoSpan.minutes, 0);
      assertEquals(chronoSpan.hours, 0);
    });
  });

  describe("fromMinutes()", () => {
    it("should instantiate from minutes", () => {
      const chronoSpan = ChronoSpan.fromMinutes(30.59);
      assertEquals(chronoSpan.milliseconds, 1835400);
      assertEquals(chronoSpan.seconds, 1835);
      assertEquals(chronoSpan.minutes, 30);
      assertEquals(chronoSpan.hours, 0);
    });
  });

  describe("fromHours()", () => {
    it("should instantiate from hours", () => {
      const chronoSpan = ChronoSpan.fromHours(2.49);
      assertEquals(chronoSpan.milliseconds, 8964000);
      assertEquals(chronoSpan.seconds, 8964);
      assertEquals(chronoSpan.minutes, 149);
      assertEquals(chronoSpan.hours, 2);
    });
  });

  describe("toString()", () => {
    it("should dislay timespan using the basic format", () => {
      assertEquals(
        ChronoSpan.fromHours(0).toString(ChronoSpanFormat.Basic),
        "00:00:00.000",
      );

      assertEquals(
        ChronoSpan.fromHours(2.25).toString(ChronoSpanFormat.Basic),
        "02:15:00.000",
      );
    });

    it("should dislay timespan using the TimeZone format", () => {
      assertEquals(
        ChronoSpan.fromHours(0).toString(ChronoSpanFormat.Basic),
        "00:00:00.000",
      );

      assertEquals(
        ChronoSpan.fromHours(2.5).toString(ChronoSpanFormat.TimeZone),
        "+0230",
      );

      assertEquals(
        ChronoSpan.fromMinutes(-420).toString(ChronoSpanFormat.TimeZone),
        "-0700",
      );
    });
  });
});
