import { NextFunction, Request, Response } from "express";
import { IGetAdminDashboardStatsUseCase } from "../../../domain/interfaces/usecases/admin/IGetAdminDashboardStatsUseCase";
import { TimePeriod } from "../../../domain/enums/timePeriod";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";
import { HTTPResponseBuilder } from "../../../utils/httpResponseBuilder";

export class AdminDashboardController {
  constructor(
    private getAdminDashboardStatsUseCase: IGetAdminDashboardStatsUseCase,
  ) { }

  async getStats(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const period = (req.query.period as TimePeriod) || TimePeriod.DAILY;
      const page = parseInt(req.query.page as string) || 1;
      const duration = req.query.duration ? parseInt(req.query.duration as string, 10) : undefined;

      const stats = await this.getAdminDashboardStatsUseCase.execute(
        period,
        page,
        duration,
      );

      HTTPResponseBuilder.buildSuccessResponse(
        req,
        res,
        HttpStatusCodes.OK,
        "Dashboard stats fetched successfully",
        stats,
      );
    } catch (error: any) {
      console.error("Error: adminDashboardController - getStats ", error);
      next(error);
    }
  }
}

