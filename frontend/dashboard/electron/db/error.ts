export class EntityNotFound extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class TotalIncomePercentageExceeded extends Error {
  constructor(message = "Total budget percentage cannot exceed 100%") {
    super(message);
  }
}
