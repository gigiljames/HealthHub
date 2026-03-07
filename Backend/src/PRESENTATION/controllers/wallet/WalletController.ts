import { Request, Response, NextFunction } from "express";
import { GetWalletUseCase } from "../../../application/usecases/wallet/GetWalletUseCase";
import { AddMoneyToWalletUseCase } from "../../../application/usecases/wallet/AddMoneyToWalletUseCase";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class WalletController {
  constructor(
    private readonly getWalletUseCase: GetWalletUseCase,
    private readonly addMoneyToWalletUseCase: AddMoneyToWalletUseCase,
  ) {}

  public getWallet = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error("Unauthorized");
      const wallet = await this.getWalletUseCase.execute(userId);
      res.status(HttpStatusCodes.OK).json({
        success: true,
        data: {
          id: wallet.id,
          balance: wallet.balance,
          currency: wallet.currency,
          userId: wallet.userId,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  public addMoney = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error("Unauthorized");
      const { amount, currency = "INR" } = req.body;
      const paymentUrl = await this.addMoneyToWalletUseCase.execute(
        userId,
        amount,
        currency,
      );
      res.status(HttpStatusCodes.OK).json({ success: true, url: paymentUrl });
    } catch (error) {
      next(error);
    }
  };
}
