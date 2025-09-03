import { assertEquals } from "@std/assert";
import { beforeAll, describe, it } from "@std/testing/bdd";
import {
  Chrono,
  ChronoFormat,
  ChronoSpan,
  ChronoSpanFormat,
} from "./chrono.ts";

describe("Chrono", () => {
  beforeAll(() => {
    Deno.env.set("TZ", "Asia/Ho_Chi_Minh");
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

  describe("unixInMilliseconds()", () => {
    it("should return milliseconds since the unix epoch", () => {
      const now = new Date();
      assertEquals(new Chrono(now).unixInMilliSeconds(), now.getTime());
    });
  });

  describe("diffInMilliseconds()", () => {
    it("should return difference in milliseconds between two Chrono instances", () => {
      const now = new Date();

      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      assertEquals(
        new Chrono(now).diffInMilliseconds(new Chrono(twoMinutesAgo)),
        2 * 60 * 1000,
      );

      const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);
      assertEquals(
        new Chrono(now).diffInMilliseconds(new Chrono(threeMinutesAgo)),
        3 * 60 * 1000,
      );

      const anHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      assertEquals(
        new Chrono(now).diffInMilliseconds(new Chrono(anHourAgo)),
        1 * 60 * 60 * 1000,
      );
    });
  });
});

describe("ChronoSpan", () => {
  describe("fromMilliseconds()", () => {
    it("should instantiate from milliseconds", () => {
      const chronoSpan = ChronoSpan.fromMilliseconds(500);
      assertEquals(chronoSpan.milliSeconds, 500);
      assertEquals(chronoSpan.seconds, 0);
      assertEquals(chronoSpan.minutes, 0);
      assertEquals(chronoSpan.hours, 0);
    });
  });

  describe("fromSeconds()", () => {
    it("should instantiate from seconds", () => {
      const chronoSpan = ChronoSpan.fromSeconds(30.5);
      assertEquals(chronoSpan.milliSeconds, 30500);
      assertEquals(chronoSpan.seconds, 30);
      assertEquals(chronoSpan.minutes, 0);
      assertEquals(chronoSpan.hours, 0);
    });
  });

  describe("fromMinutes()", () => {
    it("should instantiate from minutes", () => {
      const chronoSpan = ChronoSpan.fromMinutes(30.59);
      assertEquals(chronoSpan.milliSeconds, 1835400);
      assertEquals(chronoSpan.seconds, 1835);
      assertEquals(chronoSpan.minutes, 30);
      assertEquals(chronoSpan.hours, 0);
    });
  });

  describe("fromHours()", () => {
    it("should instantiate from hours", () => {
      const chronoSpan = ChronoSpan.fromHours(2.49);
      assertEquals(chronoSpan.milliSeconds, 8964000);
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
