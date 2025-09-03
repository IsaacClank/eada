export class Exception extends Error {
  stacktrace?: string;

  constructor(message: string, cause?: string, stacktrace?: string) {
    super(message, { cause });
    this.stacktrace = stacktrace;
  }
}
