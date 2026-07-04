import { Request, Response, NextFunction } from "express";
import { IGetTransactionsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetTransactionsUseCase";
import { IGetTransactionDetailsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetTransactionDetailsUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { getTransactionsQuerySchema } from "../../validators/transactionValidator";
import { CustomError } from "../../../domain/entities/customError";
import { MESSAGES } from "../../../domain/constants/messages";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class AdminTransactionController {
  constructor(
    private readonly _getTransactionsUseCase: IGetTransactionsUseCase,
    private readonly _getTransactionDetailsUseCase: IGetTransactionDetailsUseCase,
  ) {}

  public getTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedQuery = getTransactionsQuerySchema.safeParse(req.query);

      // console.log(validatedQuery);

      if (!validatedQuery.success) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Validation Error");
      }

      const result = await this._getTransactionsUseCase.execute(
        validatedQuery.data,
      );

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.TRANSACTION.TRANSACTIONS_FETCHED,
        result,
      );
    } catch (error) {
      if (error instanceof Error && error.name === "ZodError") {
        next(new CustomError(HttpStatusCodes.BAD_REQUEST, "Validation Error"));
      } else {
        next(error);
      }
    }
  };

  public getTransactionDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }

      const result = await this._getTransactionDetailsUseCase.execute(id);

      if (!result) {
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          MESSAGES.TRANSACTION.NOT_FOUND,
        );
      }

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        MESSAGES.TRANSACTION.TRANSACTION_FETCHED,
        result,
      );
    } catch (error) {
      next(error);
    }
  };
}

