import { Request, Response, NextFunction } from "express";
import { IGetWalletsUseCase } from "../../../domain/interfaces/usecases/wallet/IGetWalletsUseCase";
import { IGetWalletDetailsUseCase } from "../../../domain/interfaces/usecases/wallet/IGetWalletDetailsUseCase";
import { IGetWalletTransactionsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetWalletTransactionsUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class AdminWalletController {
  constructor(
    private getWalletsUseCase: IGetWalletsUseCase,
    private getWalletDetailsUseCase: IGetWalletDetailsUseCase,
    private getWalletTransactionsUseCase: IGetWalletTransactionsUseCase,
  ) {}

  public getWallets = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search as string;
      const role = req.query.role as string;
      const minBalance = req.query.minBalance
        ? parseFloat(req.query.minBalance as string)
        : undefined;
      const maxBalance = req.query.maxBalance
        ? parseFloat(req.query.maxBalance as string)
        : undefined;

      const result = await this.getWalletsUseCase.execute({
        page,
        limit,
        search,
        role,
        minBalance,
        maxBalance,
      });

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
        message: "Wallets retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getWalletDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await this.getWalletDetailsUseCase.execute(id);

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
        message: "Wallet details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getWalletTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const filters = {
        ...req.query,
        page,
        limit,
      };

      const result = await this.getWalletTransactionsUseCase.execute(
        id,
        filters,
      );

      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: result,
        message: "Wallet transactions retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
