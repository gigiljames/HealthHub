export class CustomError extends Error {
  private readonly _statusCode: number;
  private readonly _details: string;
  constructor(statusCode: number, message: string, details?: string) {
    super(message);
    this._statusCode = statusCode;
    this._details = details ?? "";
  }

  public get statusCode(): number {
    return this._statusCode;
  }

  public get details(): string {
    return this._details;
  }
}
