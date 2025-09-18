export interface UnknownJson {
  [key: string]: unknown;
}

export class ContractViolationException extends Error {
  constructor(cause?: string) {
    super("ContractViolation", { cause });
  }

  static throwIfNullOrUndefined(input: unknown, field?: string) {
    if (input == null) {
      throw new ContractViolationException(`${field} is null or undefined`);
    }
  }
}

export class Contract {
  value: unknown;
  identifier?: string = "Value";

  constructor(value: unknown, identifier?: string) {
    this.value = value;
    this.identifier = identifier ?? this.identifier;
  }

  static from(value: unknown, identifier?: string) {
    return new Contract(value, identifier);
  }

  notNull() {
    if (this.value === null) {
      throw new ContractViolationException(`${this.identifier} is null`);
    }
    return this;
  }

  notUndefined() {
    if (this.value === undefined) {
      throw new ContractViolationException(`${this.identifier} is undefined`);
    }
    return this;
  }

  notNullOrUndefined() {
    if (this.value == null) {
      throw new ContractViolationException(
        `${this.identifier} is null or undefined`,
      );
    }
    return this;
  }

  toString() {
    return String(this.value);
  }

  toNullableString() {
    return this.value ? String(this.value) : null;
  }

  toNumber() {
    return Number(this.value);
  }

  toNullableNumber() {
    return this.value ? Number(this.value) : null;
  }

  toArray() {
    if (!Array.isArray(this.value)) {
      throw new ContractViolationException(
        `${this.identifier} is not an array`,
      );
    }

    return this.value;
  }
}
