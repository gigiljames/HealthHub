import { AxiosError, type AxiosResponse } from "axios";
import axiosInstance from "../axios";

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
    const response = await axiosInstance.get(
      `/admin/hospitals?search=${search}&page=${page}&limit=${limit}&sort=${sort}`
    );
    return handleAxiosResponse(response, "GET_HOSPITALS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    console.error("Error in getHospitals:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function getHospital(id: string) {
  try {
    const response = await axiosInstance.get(`/admin/hospitals/${id}`);
    return handleAxiosResponse(response, "GET_HOSPITAL");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    console.error("Error in getHospital:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function blockHospital(id: string) {
  try {
    const response = await axiosInstance.patch(`/admin/hospitals/${id}/block`);
    return handleAxiosResponse(response, "BLOCK_HOSPITAL");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    console.error("Error in blockHospital:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function unblockHospital(id: string) {
  try {
    const response = await axiosInstance.patch(
      `/admin/hospitals/${id}/unblock`
    );
    return handleAxiosResponse(response, "UNBLOCK_HOSPITAL");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    console.error("Error in unblockHospital:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}

export async function verifyHospital(
  id: string,
  isApproved: boolean,
  remarks: string
) {
  try {
    const response = await axiosInstance.patch(
      `/admin/hospitals/${id}/verify`,
      {
        isApproved,
        verificationRemarks: remarks,
      }
    );
    return handleAxiosResponse(response, "VERIFY_HOSPITAL");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
    console.error("Error in verifyHospital:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}
