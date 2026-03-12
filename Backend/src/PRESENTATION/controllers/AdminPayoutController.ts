import { Request, Response } from "express";
import { IGetAdminPayoutsUseCase } from "../../domain/interfaces/usecases/payout/IGetAdminPayoutsUseCase";
import { IGetPayoutDetailsUseCase } from "../../domain/interfaces/usecases/payout/IGetPayoutDetailsUseCase";
import { HttpStatusCodes } from "../../domain/enums/httpStatusCodes";
import { getPayoutsQuerySchema } from "../validators/payoutValidator";

export class AdminPayoutController {
  constructor(
    private readonly getAdminPayoutsUseCase: IGetAdminPayoutsUseCase,
    private readonly getPayoutDetailsUseCase: IGetPayoutDetailsUseCase,
  ) {}

  getPayouts = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = getPayoutsQuerySchema.parse(req.query);
      const result = await this.getAdminPayoutsUseCase.execute(filters);

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error: any) {
      res
        .status(HttpStatusCodes.BAD_REQUEST)
        .json({ success: false, message: error.message });
    }
  };

  getPayoutDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.getPayoutDetailsUseCase.execute(id);

      res.status(HttpStatusCodes.OK).json({ success: true, data: result });
    } catch (error: any) {
      const status = error.statusCode || HttpStatusCodes.BAD_REQUEST;
      res.status(status).json({ success: false, message: error.message });
    }
  };
}
