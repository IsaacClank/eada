export enum ErrorCodes {
  UnexpectedError,
}

export const error = (code: ErrorCodes, msg: string) => {
  throw `${code}: ${msg}`;
};
