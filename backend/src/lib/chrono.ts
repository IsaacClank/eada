export enum ChronoFormat {
  Basic,
  Iso8061,
}

export class Chrono {
  date: Date;

  constructor(date?: Date) {
    this.date = date ?? new Date();
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

  unixInMilliSeconds(): number {
    return this.date.getTime();
  }

  diffInMilliseconds(other: Chrono): number {
    return this.diff(other).milliSeconds;
  }

  private diff(other: Chrono): ChronoSpan {
    return ChronoSpan.fromMilliseconds(
      this.unixInMilliSeconds() - other.unixInMilliSeconds(),
    );
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
  milliSeconds!: number;

  private constructor() {}

  static fromMilliseconds(ms: number) {
    const abs = Math.abs(ms);
    const timespan = new ChronoSpan();

    timespan.isNegative = ms < 0;
    timespan.milliSeconds = abs;
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
    const minutes = this.minutes % (this.hours * 60);
    const seconds = this.seconds % (this.minutes * 60);
    const milliSeconds = this.milliSeconds % (this.seconds * 1000);

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
