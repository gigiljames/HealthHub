import { Request, Response, NextFunction } from "express";
import { GetWalletUseCase } from "../../../application/usecases/wallet/GetWalletUseCase";
import { AddMoneyToWalletUseCase } from "../../../application/usecases/wallet/AddMoneyToWalletUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { CustomError } from "../../../domain/entities/customError";
import { MESSAGES } from "../../../domain/constants/messages";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class WalletController {
  constructor(
    private readonly _getWalletUseCase: GetWalletUseCase,
    private readonly _addMoneyToWalletUseCase: AddMoneyToWalletUseCase,
  ) {}

  public getWallet = async (
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
      const wallet = await this._getWalletUseCase.execute(userId);
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Wallet fetched successfully",
        {
          id: wallet.id,
          balance: wallet.balance,
          currency: wallet.currency,
          userId: wallet.userId,
        },
      );
    } catch (error) {
      next(error);
    }
  };

  public addMoney = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId)
        throw new CustomError(
          HttpStatusCodes.UNAUTHORIZED,
          MESSAGES.AUTH_MIDDLEWARE_ERROR,
        );
      const { amount, currency = "INR" } = req.body;
      const paymentUrl = await this._addMoneyToWalletUseCase.execute(
        userId,
        amount,
        currency,
      );
      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Money added to wallet",
        { url: paymentUrl },
      );
    } catch (error) {
      next(error);
    }
  };
}

