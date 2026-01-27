import { AxiosError, type AxiosResponse } from "axios";
import axiosInstance from "../axios";
import { ROUTES } from "../../constants/routes";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function listOrganizations() {
  try {
    const response = await axiosInstance.get(
      ROUTES.ORGANIZATION.LIST_ORGANIZATIONS,
    );
    return handleAxiosResponse(response, "LIST_ORGANIZATIONS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
