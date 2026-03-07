import { Request, Response, NextFunction } from "express";
import { GetTransactionsUseCase } from "../../../application/usecases/transaction/GetTransactionsUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { TransactionType } from "../../../domain/enums/transactionType";
import { TransactionDirection } from "../../../domain/enums/transactionDirection";
import { PaymentStatus } from "../../../domain/enums/paymentStatus";
import { TransactionSource } from "../../../domain/enums/transactionSource";

export class TransactionController {
  constructor(
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
  ) {}

  private extractFilters(req: Request) {
    return {
      search: req.query.search as string,
      source: req.query.source as TransactionSource,
      direction: req.query.direction as TransactionDirection,
      status: req.query.status as PaymentStatus,
      type: req.query.type as TransactionType,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    };
  }

  public getUserTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error("Unauthorized");
      const filters = this.extractFilters(req);
      const result = await this.getTransactionsUseCase.getUserTransactions(
        userId,
        filters,
      );
      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
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
      if (!doctorId) throw new Error("Unauthorized");
      const filters = this.extractFilters(req);
      const result = await this.getTransactionsUseCase.getDoctorTransactions(
        doctorId,
        filters,
      );
      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
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
      const filters = this.extractFilters(req);
      const result =
        await this.getTransactionsUseCase.getAllTransactions(filters);
      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
