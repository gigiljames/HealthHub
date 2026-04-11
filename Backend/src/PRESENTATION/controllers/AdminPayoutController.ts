import { NextFunction, Request, Response } from "express";
import { IGetAdminPayoutsUseCase } from "../../domain/interfaces/usecases/payout/IGetAdminPayoutsUseCase";
import { IGetPayoutDetailsUseCase } from "../../domain/interfaces/usecases/payout/IGetPayoutDetailsUseCase";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { getPayoutsQuerySchema } from "../validators/payoutValidator";
import { CustomError } from "../../domain/entities/customError";
import { MESSAGES } from "../../domain/constants/messages";

export class AdminPayoutController {
  constructor(
    private readonly _getAdminPayoutsUseCase: IGetAdminPayoutsUseCase,
    private readonly _getPayoutDetailsUseCase: IGetPayoutDetailsUseCase,
  ) {}

  getPayouts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const filters = getPayoutsQuerySchema.safeParse(req.query);
      if (!filters.success) {
        throw new CustomError(
          HttpStatusCodes.BAD_REQUEST,
          MESSAGES.BAD_REQUEST,
        );
      }
      const result = await this._getAdminPayoutsUseCase.execute(filters.data);

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  getPayoutDetails = async (
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
      const result = await this._getPayoutDetailsUseCase.execute(id);

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
