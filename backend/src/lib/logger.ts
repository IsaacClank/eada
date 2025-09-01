import { Chrono, ChronoFormat } from "../lib/chrono.ts";

export class Logger {
  static log(message: string) {
    console.log(`[${new Chrono().toString(ChronoFormat.Iso8061)}] ${message}`);
  }
}
