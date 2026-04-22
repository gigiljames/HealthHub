import { TimePeriod } from "../../../../domain/enums/timePeriod";
import { AdminDashboardDTO } from "../../../DTOs/admin/dashboardDTOs";

export interface IGetAdminDashboardStatsUseCase {
  execute(period: TimePeriod, page: number): Promise<AdminDashboardDTO>;
}
