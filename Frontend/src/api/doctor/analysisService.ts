import axiosInstance from "../axios";
import { ROUTES } from "../../constants/routes";
import type { DoctorAnalysisStats } from "../../types/doctorAnalysis";

export const getDoctorAnalysis = async (
  period: string,
  locationId?: string | null,
  duration?: number,
): Promise<DoctorAnalysisStats> => {
  const params: Record<string, any> = { period };
  if (locationId) {
    params.locationId = locationId;
  }
  if (duration !== undefined) {
    params.duration = duration;
  }

  const response = await axiosInstance.get(
    ROUTES.DOCTOR.GET_DASHBOARD_ANALYSIS,
    {
      params,
    },
  );

  return response.data.data;
};
