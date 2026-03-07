import { ROUTES } from "../../constants/routes";
import axiosInstance from "../axios";

export const getDoctorWallet = async () => {
  const response = await axiosInstance.get(ROUTES.WALLET.GET_WALLET);
  return response.data;
};

export const getDoctorTransactions = async (params?: Record<string, any>) => {
  const response = await axiosInstance.get(
    ROUTES.TRANSACTIONS.GET_DOCTOR_TRANSACTIONS,
    {
      params,
    },
  );
  return response.data;
};
