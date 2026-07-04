import axiosInstance from "../axios";
import { ROUTES } from "../../constants/routes";

export const getWallets = async (params: any) => {
  const response = await axiosInstance.get(ROUTES.ADMIN_WALLET.GET_WALLETS, {
    params,
  });
  return response.data;
};

export const getWalletDetails = async (walletId: string) => {
  const response = await axiosInstance.get(
    ROUTES.ADMIN_WALLET.GET_WALLET.replace(":id", walletId),
  );
  return response.data;
};

export const getWalletTransactions = async (walletId: string, params: any) => {
  const response = await axiosInstance.get(
    ROUTES.ADMIN_WALLET.GET_WALLET_TRANSACTIONS.replace(":id", walletId),
    { params },
  );
  return response.data;
};
