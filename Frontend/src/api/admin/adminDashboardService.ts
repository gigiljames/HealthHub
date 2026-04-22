import axiosInstance from "../axios";
import { type AdminDashboardDTO, TimePeriod } from "../../types/adminDashboard";
import { ROUTES } from "../../constants/routes";

export const getDashboardStats = async (
  period: TimePeriod,
  page: number = 1,
): Promise<AdminDashboardDTO> => {
  const response = await axiosInstance.get(ROUTES.ADMI_DASHBOARD.GET_STATS, {
    params: { period, page },
  });
  return response.data.data;
};
