import { Response, Request } from "express";
import { HttpResponse } from "../domain/types/httpResponseType";

export class HTTPResponseBuilder {
  static buildSuccessResponse<T = unknown>(
    req: Request,
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
  ): void {
    void req;
    const response: HttpResponse<T> = {
      success: true,
      data,
      message,
      statusCode,
    };

    res.status(statusCode).json(response);
  }

  static buildErrorResponse(
    req: Request,
    res: Response,
    statusCode: number,
    error: string,
  ): void {
    void req;
    const response: HttpResponse<object> = {
      success: false,
      error,
      message: error,
      statusCode,
    };

    res.status(statusCode).json(response);
  }
}


