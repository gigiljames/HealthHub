import { AxiosError, type AxiosResponse } from "axios";
import axiosInstance from "../axios";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function getDoctors(
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

    const response = await axiosInstance.get(
      `/admin/doctors?${params.toString()}`
    );
    return handleAxiosResponse(response, "GET_DOCTORS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getDoctor(id: string) {
  try {
    const response = await axiosInstance.get(`/admin/doctors/${id}`);
    return handleAxiosResponse(response, "GET_DOCTOR");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function blockDoctor(id: string) {
  try {
    const response = await axiosInstance.patch(`/admin/doctors/${id}/block`);
    return handleAxiosResponse(response, "BLOCK_DOCTOR");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function unblockDoctor(id: string) {
  try {
    const response = await axiosInstance.patch(`/admin/doctors/${id}/unblock`);
    return handleAxiosResponse(response, "UNBLOCK_DOCTOR");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function verifyDoctor(
  id: string,
  isApproved: boolean,
  verificationRemarks: string
) {
  try {
    const response = await axiosInstance.patch(`/admin/doctors/${id}/verify`, {
      isApproved,
      verificationRemarks,
    });
    return handleAxiosResponse(response, "VERIFY_DOCTOR");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
