import { AxiosError, type AxiosResponse } from "axios";
import axiosInstance from "../axios";
import { ROUTES } from "../../constants/routes";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function getPublicDoctors(
  search: string = "",
  sort: string = "",
  page: number = 1,
  limit: number = 6,
  location: number[] = [],
  consultationMode: string[] = [],
  languages: string[] = [],
  gender: string = "",
  specialization: string = "",
  consultationFee: string = "",
) {
  try {
    const params = new URLSearchParams({
      search,
      sort,
      page: page.toString(),
      limit: limit.toString(),
    });

    if (gender) params.append("gender", gender);
    if (specialization) params.append("specialization", specialization);
    if (consultationFee) params.append("consultationFee", consultationFee);
    if (location.length > 0)
      params.append("location", JSON.stringify(location));
    params.append("consultationModes", JSON.stringify(consultationMode));
    params.append("languages", JSON.stringify(languages));

    const response = await axiosInstance.get(
      `${ROUTES.DOCTOR.GET_PUBLIC_DOCTORS}?${params.toString()}`,
    );
    return handleAxiosResponse(response, "GET_PUBLIC_DOCTORS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getPublicDoctorProfile(id: string) {
  try {
    const response = await axiosInstance.get(
      ROUTES.DOCTOR.GET_PUBLIC_DOCTOR_PROFILE.replace(":id", id),
    );
    return handleAxiosResponse(response, "GET_PUBLIC_DOCTOR_PROFILE");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    throw error;
  }
}
