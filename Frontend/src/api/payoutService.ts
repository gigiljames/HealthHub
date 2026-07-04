import axiosInstance from "./axios";
import { ROUTES } from "../constants/routes";

export const getDoctorPayouts = async (params?: Record<string, any>) => {
  const response = await axiosInstance.get(ROUTES.PAYOUTS.GET_DOCTOR_PAYOUTS, {
    params,
  });
  return response.data;
};

export const getDoctorPayoutDetails = async (id: string) => {
  const response = await axiosInstance.get(
    ROUTES.PAYOUTS.GET_DOCTOR_PAYOUT_DETAILS.replace(":id", id),
  );
  return response.data;
};

export const getAdminPayouts = async (params?: Record<string, any>) => {
  const response = await axiosInstance.get(ROUTES.PAYOUTS.GET_ADMIN_PAYOUTS, {
    params,
  });
  return response.data;
};

export const getAdminPayoutDetails = async (id: string) => {
  const response = await axiosInstance.get(
    ROUTES.PAYOUTS.GET_ADMIN_PAYOUT_DETAILS.replace(":id", id),
  );
  return response.data;
};
