import axiosInstance from "../axios";
import { ROUTES } from "../../constants/routes";

export const getAdminAppointments = async (params: any) => {
  const response = await axiosInstance.get(
    ROUTES.ADMIN.APPOINTMENT_MANAGEMENT.GET_APPOINTMENTS,
    {
      params,
    },
  );
  return response.data;
};

export const getAdminAppointmentById = async (appointmentId: string) => {
  const route = ROUTES.ADMIN.APPOINTMENT_MANAGEMENT.GET_APPOINTMENT.replace(
    ":appointmentId",
    appointmentId,
  );
  const response = await axiosInstance.get(route);
  return response.data;
};
