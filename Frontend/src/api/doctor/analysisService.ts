import axiosInstance from "../axios";
import { ROUTES } from "../../constants/routes";
import type { DoctorAnalysisStats } from "../../types/doctorAnalysis";

export const getDoctorAnalysis = async (
  period: string,
  locationId?: string | null,
): Promise<DoctorAnalysisStats> => {
  const params: Record<string, string> = { period };
  if (locationId) {
    params.locationId = locationId;
  }

  const response = await axiosInstance.get(
    ROUTES.DOCTOR.GET_DASHBOARD_ANALYSIS,
    {
      params,
    },
  );

  return response.data.data;
};
