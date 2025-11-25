import { AxiosError, type AxiosResponse } from "axios";
import axios from "../axios";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function getHospitals(
  search: string,
  page: number,
  limit: number,
  sort: string
) {
  try {
    const response = await axios.get(
      `/admin/hospitals?search=${search}&page=${page}&limit=${limit}&sort=${sort}`
    );
    return handleAxiosResponse(response, "GET_HOSPITALS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
