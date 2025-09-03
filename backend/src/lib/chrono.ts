export type ChronoUnit = "Year" | "Month" | "Day";

export enum ChronoFormat {
  Basic,
  Iso8061,
}

export class Chrono {
  private date: Date;

  constructor(date?: Date) {
    this.date = date ?? new Date();
  }

  static from(date: Date | string): Chrono {
    if (typeof date === "string") {
      return Chrono.fromMillis(Date.parse(date));
    }

    return new Chrono(date);
  }

  static now() {
    return Chrono.from(new Date());
  }

  static fromUnix(seconds: number) {
    return new Chrono(new Date(seconds * 1000));
  }

  static fromMillis(ms: number) {
    return new Chrono(new Date(ms));
  }

  year() {
    return this.date.getFullYear();
  }
  setYear(value: number) {
    const clone = Chrono.from(this.date);
    clone.date.setFullYear(value);
    return clone;
  }

  month() {
    return this.date.getMonth();
  }
  setMonth(value: number) {
    const clone = Chrono.from(this.date);
    clone.date.setMonth(value);
    return clone;
  }

  day() {
    return this.date.getDate();
  }
  setDay(value: number) {
    const clone = Chrono.from(this.date);
    clone.date.setDate(value);
    return clone;
  }

  hours() {
    return this.date.getHours();
  }
  setHours(value: number) {
    const clone = Chrono.from(this.date);
    clone.date.setHours(value);
    return clone;
  }

  minutes() {
    return this.date.getMinutes();
  }
  setMinutes(value: number) {
    const clone = Chrono.from(this.date);
    clone.date.setMinutes(value);
    return clone;
  }

  seconds() {
    return this.date.getSeconds();
  }
  setSeconds(value: number) {
    const clone = Chrono.from(this.date);
    clone.date.setSeconds(value);
    return clone;
  }

  milliseconds() {
    return this.date.getMilliseconds();
  }
  setMilliseconds(value: number) {
    const clone = Chrono.from(this.date);
    clone.date.setMilliseconds(value);
    return clone;
  }

  unix(): number {
    return Math.floor(this.date.getTime() / 1000);
  }

  millis(): number {
    return this.date.getTime();
  }

  diff(other: Chrono): ChronoSpan {
    return ChronoSpan.fromMilliseconds(this.millis() - other.millis());
  }

  startOf(p: ChronoUnit) {
    if (p === "Year") {
      return new Chrono(new Date(this.year(), 0, 1, 0, 0, 0, 0));
    }

    if (p === "Month") {
      return new Chrono(new Date(this.year(), this.month(), 1, 0, 0, 0, 0));
    }

    if (p === "Day") {
      return new Chrono(
        new Date(this.year(), this.month(), this.day(), 0, 0, 0, 0),
      );
    }

    throw new Error(`Unexpected Chrono unit: ${p}`);
  }

  toString(format: ChronoFormat = ChronoFormat.Iso8061) {
    const year = this.date.getFullYear();
    const month = this.date.getMonth() + 1;
    const day = this.date.getDate();
    const hours = this.date.getHours();
    const minutes = this.date.getMinutes();
    const seconds = this.date.getSeconds();
    const milliSeconds = this.date.getMilliseconds();
    const timeZone = ChronoSpan.fromMinutes(-this.date.getTimezoneOffset());

    const yearStr = year.toString().padStart(2, "0");
    const monthStr = month.toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const hoursStr = hours.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");
    const milliSecondsStr = milliSeconds.toString().padStart(3, "0");
    const timeZoneStr = timeZone.toString(ChronoSpanFormat.TimeZone);

    if (format == ChronoFormat.Iso8061) {
      return `${yearStr}-${monthStr}-${dayStr}T${hoursStr}:${minutesStr}:${secondsStr}.${milliSecondsStr}${timeZoneStr}`;
    }

    return this.date.toString();
  }
}

export enum ChronoSpanFormat {
  Basic,
  TimeZone,
}

export class ChronoSpan {
  isNegative: boolean = true;
  hours!: number;
  minutes!: number;
  seconds!: number;
  milliseconds!: number;

  private constructor() {}

  static fromMilliseconds(ms: number) {
    const abs = Math.abs(ms);
    const timespan = new ChronoSpan();

    timespan.isNegative = ms < 0;
    timespan.milliseconds = abs;
    timespan.seconds = Math.floor(abs / 1000);
    timespan.minutes = Math.floor(abs / 1000 / 60);
    timespan.hours = Math.floor(abs / 1000 / 60 / 60);

    return timespan;
  }

  static fromSeconds(seconds: number) {
    return ChronoSpan.fromMilliseconds(seconds * 1000);
  }

  static fromMinutes(minutes: number) {
    return ChronoSpan.fromMilliseconds(minutes * 60 * 1000);
  }

  static fromHours(hours: number) {
    return ChronoSpan.fromMilliseconds(hours * 60 * 60 * 1000);
  }

  toString(format: ChronoSpanFormat) {
    const hours = this.hours;

    let minutes = this.minutes % (this.hours * 60);
    minutes = isNaN(minutes) ? 0 : minutes;

    let seconds = this.seconds % (this.minutes * 60);
    seconds = isNaN(seconds) ? 0 : seconds;

    let milliSeconds = this.milliseconds % (this.seconds * 1000);
    milliSeconds = isNaN(milliSeconds) ? 0 : milliSeconds;

    const hoursStr = hours.toString().padStart(2, "0");
    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");
    const milliSecondsStr = milliSeconds.toString().padStart(3, "0");

    if (format === ChronoSpanFormat.TimeZone) {
      return `${this.isNegative ? "-" : "+"}${hoursStr}${minutesStr}`;
    }

    return `${hoursStr}:${minutesStr}:${secondsStr}.${milliSecondsStr}`;
  }
}
