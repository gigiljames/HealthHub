import { ROUTES } from "../../constants/routes";
import axiosInstance from "../axios";

export const lockSlot = async (slotId: string) => {
  const response = await axiosInstance.post(
    ROUTES.SLOT.LOCK_SLOT.replace(":slotId", slotId),
  );
  return response.data;
};

export const getAppointmentSummary = async (slotId: string) => {
  const response = await axiosInstance.get(
    ROUTES.SLOT.GET_APPOINTMENT_SUMMARY.replace(":slotId", slotId),
  );
  return response.data;
};

export const bookAppointment = async (
  slotId: string,
  data: {
    reason: string;
    amount: number;
    currency: string;
    paymentMode: string;
  },
) => {
  const response = await axiosInstance.post(
    ROUTES.SLOT.BOOK_APPOINTMENT.replace(":slotId", slotId),
    data,
  );
  return response.data;
};

export const getPatientAppointments = async (params?: Record<string, any>) => {
  const response = await axiosInstance.get(
    ROUTES.APPOINTMENT.GET_PATIENT_APPOINTMENTS,
    {
      params,
    },
  );
  return response.data;
};

export const getAppointmentById = async (appointmentId: string) => {
  const response = await axiosInstance.get(
    ROUTES.APPOINTMENT.GET_PATIENT_APPOINTMENT.replace(
      ":appointmentId",
      appointmentId,
    ),
  );
  return response.data;
};

export const cancelAppointment = async (appointmentId: string) => {
  const response = await axiosInstance.patch(
    ROUTES.APPOINTMENT.CANCEL_APPOINTMENT.replace(
      ":appointmentId",
      appointmentId,
    ),
  );
  return response.data;
};
