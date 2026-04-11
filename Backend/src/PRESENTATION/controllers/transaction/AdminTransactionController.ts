import { Request, Response, NextFunction } from "express";
import { IGetTransactionsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetTransactionsUseCase";
import { IGetTransactionDetailsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetTransactionDetailsUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { getTransactionsQuerySchema } from "../../validators/transactionValidator";
import { CustomError } from "../../../domain/entities/customError";
import { MESSAGES } from "../../../domain/constants/messages";

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

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
        message: MESSAGES.TRANSACTION.TRANSACTIONS_FETCHED,
      });
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

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
        message: MESSAGES.TRANSACTION.TRANSACTION_FETCHED,
      });
    } catch (error) {
      next(error);
    }
  };
}
