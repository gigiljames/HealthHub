import { ROUTES } from "../../constants/routes";
import axiosInstance from "../axios";

export const getWallet = async () => {
  const response = await axiosInstance.get(ROUTES.WALLET.GET_WALLET);
  return response.data;
};

export const addMoneyToWallet = async (amount: number, currency = "INR") => {
  const response = await axiosInstance.post(ROUTES.WALLET.ADD_MONEY_TO_WALLET, {
    amount,
    currency,
  });
  return response.data;
};

export const getUserTransactions = async (params?: Record<string, any>) => {
  const response = await axiosInstance.get(
    ROUTES.TRANSACTIONS.GET_USER_TRANSACTIONS,
    {
      params,
    },
  );
  return response.data;
};
