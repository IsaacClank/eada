import { Chrono, ChronoFormat } from "../lib/chrono.ts";

export class Logger {
  static log(message: unknown) {
    console.log(`[${new Chrono().toString(ChronoFormat.Iso8061)}] ${message}`);
  }

  static err(message: unknown) {
    console.error(
      `[${new Chrono().toString(ChronoFormat.Iso8061)}] ${message}`,
    );
  }
}
