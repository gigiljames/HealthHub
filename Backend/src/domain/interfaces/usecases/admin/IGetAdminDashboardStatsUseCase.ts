import { TimePeriod } from "../../../enums/timePeriod";
import { AdminDashboardDTO } from "../../../../application/DTOs/admin/dashboardDTOs";

export interface IGetAdminDashboardStatsUseCase {
  execute(period: TimePeriod, page: number, duration?: number): Promise<AdminDashboardDTO>;
}
