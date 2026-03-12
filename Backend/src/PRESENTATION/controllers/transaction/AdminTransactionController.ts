import { Request, Response, NextFunction } from "express";
import { IGetTransactionsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetTransactionsUseCase";
import { IGetTransactionDetailsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetTransactionDetailsUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { getTransactionsQuerySchema } from "../../validators/transactionValidator";
import { CustomError } from "../../../domain/entities/customError";

export class AdminTransactionController {
  constructor(
    private readonly getTransactionsUseCase: IGetTransactionsUseCase,
    private readonly getTransactionDetailsUseCase: IGetTransactionDetailsUseCase,
  ) {}

  public getTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const validatedQuery = getTransactionsQuerySchema.safeParse(req.query);

      console.log(validatedQuery);

      if (!validatedQuery.success) {
        throw new CustomError(HttpStatusCodes.BAD_REQUEST, "Validation Error");
      }

      const result = await this.getTransactionsUseCase.execute(
        validatedQuery.data,
      );

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
        message: "Transactions retrieved successfully",
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

      const result = await this.getTransactionDetailsUseCase.execute(id);

      if (!result) {
        throw new CustomError(
          HttpStatusCodes.NOT_FOUND,
          "Transaction not found",
        );
      }

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
        message: "Transaction details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
