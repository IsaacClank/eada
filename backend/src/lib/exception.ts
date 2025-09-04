export class Exception extends Error {
  constructor(message: string, cause?: string) {
    super(message, { cause });
  }

  override toString() {
    return `${this.message}: ${this.cause}`;
  }
}
