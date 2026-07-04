import axiosInstance from "../axios";
import {
  type AdminDashboardDTO,
  type TimePeriod,
} from "../../types/adminDashboard";
import { ROUTES } from "../../constants/routes";

export const getDashboardStats = async (
  period: TimePeriod,
  page: number = 1,
  duration?: number,
): Promise<AdminDashboardDTO> => {
  const params: Record<string, any> = { period, page };
  if (duration !== undefined) {
    params.duration = duration;
  }
  const response = await axiosInstance.get(ROUTES.ADMI_DASHBOARD.GET_STATS, {
    params,
  });
  return response.data.data;
};
