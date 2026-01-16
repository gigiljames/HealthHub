import { AxiosError, type AxiosResponse } from "axios";
import axios from "../axios";
import { ROUTES } from "../../constants/routes";

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
  sort: string,
  blocked?: boolean,
  unblocked?: boolean,
  newUser?: boolean
) {
  try {
    const params = new URLSearchParams({
      search,
      page: page.toString(),
      limit: limit.toString(),
      sort,
    });

    if (blocked !== undefined) params.append("blocked", blocked.toString());
    if (unblocked !== undefined)
      params.append("unblocked", unblocked.toString());
    if (newUser !== undefined) params.append("newUser", newUser.toString());

    const response = await axios.get(
      `${ROUTES.USER.GET_USERS}?${params.toString()}`
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
    const response = await axios.get(
      `${ROUTES.USER.GET_USER_PROFILE.replace(":id", id)}`
    );
    return handleAxiosResponse(response, "GET_USER");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function blockUser(id: string) {
  try {
    const response = await axios.patch(
      `${ROUTES.USER.BLOCK_USER.replace(":id", id)}`
    );
    return handleAxiosResponse(response, "BLOCK_USER");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function unblockUser(id: string) {
  try {
    const response = await axios.patch(
      `${ROUTES.USER.UNBLOCK_USER.replace(":id", id)}`
    );
    return handleAxiosResponse(response, "UNBLOCK_USER");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
