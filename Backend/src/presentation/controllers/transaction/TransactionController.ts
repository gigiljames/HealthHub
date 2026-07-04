import { Request, Response, NextFunction } from "express";
import { GetTransactionsUseCase } from "../../../application/usecases/transaction/GetTransactionsUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { CustomError } from "../../../domain/entities/customError";
import { MESSAGES } from "../../../domain/constants/messages";
import { getTransactionsQuerySchema } from "../../validators/transactionValidator";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class TransactionController {
  constructor(
    private readonly _getTransactionsUseCase: GetTransactionsUseCase,
  ) {}

  private parseFilters(req: Request) {
    const parsed = getTransactionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new CustomError(HttpStatusCodes.BAD_REQUEST, MESSAGES.BAD_REQUEST);
    }
    return parsed.data;
  }

  public getUserTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.userId;
      if (!userId)
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      const filters = this.parseFilters(req);
      const result = await this._getTransactionsUseCase.getUserTransactions(
        userId,
        filters,
      );
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "User transactions retrieved successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  public getDoctorTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const doctorId = req.user?.userId;
      if (!doctorId)
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      const filters = this.parseFilters(req);
      const result = await this._getTransactionsUseCase.getDoctorTransactions(
        doctorId,
        filters,
      );
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Doctor transactions retrieved successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  };

  public getAllTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const filters = this.parseFilters(req);
      const result =
        await this._getTransactionsUseCase.getAllTransactions(filters);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "All transactions retrieved successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  };
}

