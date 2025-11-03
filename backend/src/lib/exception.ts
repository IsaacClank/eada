import { ErrorStatus, Status } from "@oak/common/status";
import { HttpError } from "@oak/common/http_errors";

export class HttpException<T extends ErrorStatus> extends HttpError<T> {
  constructor(errorCode: string, cause?: string) {
    super(errorCode, { cause });
  }
}

export class NotImplementedException
  extends HttpException<Status.NotImplemented> {
  constructor() {
    super("NotImplemented");
  }
}
