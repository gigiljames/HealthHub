import { ROUTES } from "../../constants/routes";
import axiosInstance from "../axios";

export const getDoctorAppointments = async (params?: {
  tab?: string;
  search?: string;
  status?: string;
  mode?: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  sort?: "newest" | "oldest";
  paymentStatus?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const response = await axiosInstance.get(
      ROUTES.APPOINTMENT.GET_DOCTOR_APPOINTMENTS,
      {
        params,
      },
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: "An unexpected error occurred" };
  }
};

export const getDoctorAppointmentById = async (appointmentId: string) => {
  try {
    const url = ROUTES.APPOINTMENT.GET_DOCTOR_APPOINTMENT.replace(
      ":appointmentId",
      appointmentId,
    );
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: "An unexpected error occurred" };
  }
};
