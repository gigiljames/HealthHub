import { AxiosError, type AxiosResponse } from "axios";
import axios from "../axios";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function getUsers(
  search: string,
  page: number,
  limit: number,
  sort: string
) {
  try {
    const response = await axios.get(
      `/admin/users?search=${search}&page=${page}&limit=${limit}&sort=${sort}`
    );
    return handleAxiosResponse(response, "GET_USERS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getUser(id: string) {
  try {
    const response = await axios.get(`/admin/user/${id}`);
    return handleAxiosResponse(response, "GET_USER");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function blockUser(id: string) {
  try {
    const response = await axios.get(`/admin/user/block/${id}`);
    return handleAxiosResponse(response, "BLOCK_USER");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function unblockUser(id: string) {
  try {
    const response = await axios.get(`/admin/user/unblock/${id}`);
    return handleAxiosResponse(response, "UNBLOCK_USER");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
