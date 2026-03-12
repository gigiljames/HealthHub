import axiosInstance from "../axios";

export const getTransactions = async (filters: any) => {
  const response = await axiosInstance.get("/transactions", {
    params: filters,
  });
  return response.data;
};

export const getTransactionDetails = async (transactionId: string) => {
  const response = await axiosInstance.get(`/transactions/${transactionId}`);
  return response.data;
};
