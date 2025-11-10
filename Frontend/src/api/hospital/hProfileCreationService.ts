import axios from "../axios";
import { AxiosError, type AxiosResponse } from "axios";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function saveHospitalProfileStage1(data: any) {
  try {
    const response = await axios.patch("/hospital/profile-creation-1", data);
    return handleAxiosResponse(response, "SAVE_HOSPITAL_PROFILE_1");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function saveHospitalProfileStage2(data: any) {
  try {
    const response = await axios.patch("/hospital/profile-creation-2", data);
    return handleAxiosResponse(response, "SAVE_HOSPITAL_PROFILE_2");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function saveHospitalProfileStage3(data: any) {
  try {
    const response = await axios.patch("/hospital/profile-creation-3", data);
    return handleAxiosResponse(response, "SAVE_HOSPITAL_PROFILE_3");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function saveHospitalProfileStage4(data: any) {
  try {
    const response = await axios.patch("/hospital/profile-creation-4", data);
    return handleAxiosResponse(response, "SAVE_HOSPITAL_PROFILE_4");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function saveHospitalProfileStage5(data: any) {
  try {
    const response = await axios.patch("/hospital/profile-creation-5", data);
    return handleAxiosResponse(response, "SAVE_HOSPITAL_PROFILE_5");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalProfileStage1() {
  try {
    const response = await axios.get("/hospital/profile-creation-1");
    return handleAxiosResponse(response, "GET_HOSPITAL_PROFILE_1");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalProfileStage2() {
  try {
    const response = await axios.get("/hospital/profile-creation-2");
    return handleAxiosResponse(response, "GET_HOSPITAL_PROFILE_2");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalProfileStage3() {
  try {
    const response = await axios.get("/hospital/profile-creation-3");
    return handleAxiosResponse(response, "GET_HOSPITAL_PROFILE_3");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalProfileStage4() {
  try {
    const response = await axios.get("/hospital/profile-creation-4");
    return handleAxiosResponse(response, "GET_HOSPITAL_PROFILE_4");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalProfileStage5() {
  try {
    const response = await axios.get("/hospital/profile-creation-5");
    return handleAxiosResponse(response, "GET_HOSPITAL_PROFILE_5");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}
