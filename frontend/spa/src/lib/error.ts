export enum ErrorCodes {
  UnexpectedError,
}

export const error = (code: ErrorCodes, msg: string) => {
  return `${code}: ${msg}`;
};
