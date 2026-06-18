import { NextFunction, Request, Response } from "express";
import { IGetAdminDashboardStatsUseCase } from "../../../application/interfaces/usecases/admin/IGetAdminDashboardStatsUseCase";
import { TimePeriod } from "../../../domain/enums/timePeriod";
import { HttpStatusCodes } from "../../../domain/enums/httpStatusCodes";

export class AdminDashboardController {
  constructor(
    private getAdminDashboardStatsUseCase: IGetAdminDashboardStatsUseCase,
  ) {}

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

      res.status(HttpStatusCodes.OK).json({
        success: true,
        message: "Dashboard stats fetched successfully",
        data: stats,
      });
    } catch (error: any) {
      console.error("Error: adminDashboardController - getStats ", error);
      next(error);
    }
  }
}
