import api from "./axios";
import { ROUTES } from "../constants/routes";

export const joinConsultation = async (appointmentId: string) => {
  const response = await api.post(ROUTES.CONSULTATION.JOIN_CONSULTATION, {
    appointmentId,
  });
  return response.data;
};

export const endConsultation = async (appointmentId: string) => {
  const response = await api.post(ROUTES.CONSULTATION.END_CONSULTATION, {
    appointmentId,
  });
  return response.data;
};
