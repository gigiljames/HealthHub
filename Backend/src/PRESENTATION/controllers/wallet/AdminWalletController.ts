import { Request, Response, NextFunction } from "express";
import { IGetWalletsUseCase } from "../../../domain/interfaces/usecases/wallet/IGetWalletsUseCase";
import { IGetWalletDetailsUseCase } from "../../../domain/interfaces/usecases/wallet/IGetWalletDetailsUseCase";
import { IGetWalletTransactionsUseCase } from "../../../domain/interfaces/usecases/transaction/IGetWalletTransactionsUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class AdminWalletController {
  constructor(
    private readonly _getWalletsUseCase: IGetWalletsUseCase,
    private readonly _getWalletDetailsUseCase: IGetWalletDetailsUseCase,
    private readonly _getWalletTransactionsUseCase: IGetWalletTransactionsUseCase,
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

      const result = await this._getWalletsUseCase.execute({
        page,
        limit,
        search,
        role,
        minBalance,
        maxBalance,
      });

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Wallets retrieved successfully",
        result,
      );
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

      const result = await this._getWalletDetailsUseCase.execute(id);

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Wallet details retrieved successfully",
        result,
      );
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

      const result = await this._getWalletTransactionsUseCase.execute(
        id,
        filters,
      );

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Wallet transactions retrieved successfully",
        result,
      );
    } catch (error) {
      next(error);
    }
  };
}

