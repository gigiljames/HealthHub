import axios from "../axios";
import { AxiosError, type AxiosResponse } from "axios";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function getSpecializationList() {
  try {
    const response = await axios.get("/doctor/specialization-list");
    return handleAxiosResponse(response, "GET_SPECIALIZATION_LIST");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveDoctorProfileStage1(data: any) {
  try {
    const response = await axios.post("/doctor/profile/stage1", data);
    return handleAxiosResponse(response, "SAVE_DOCTOR_PROFILE_STAGE1");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getDoctorProfileStage1() {
  try {
    const response = await axios.get("/doctor/profile/stage1");
    return handleAxiosResponse(response, "GET_DOCTOR_PROFILE_STAGE1");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveDoctorProfileStage2(data: any) {
  try {
    const response = await axios.post("/doctor/profile/stage2", data);
    return handleAxiosResponse(response, "SAVE_DOCTOR_PROFILE_STAGE2");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getDoctorProfileStage2() {
  try {
    const response = await axios.get("/doctor/profile/stage2");
    return handleAxiosResponse(response, "GET_DOCTOR_PROFILE_STAGE2");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveDoctorProfileStage3(data: any) {
  try {
    const response = await axios.post("/doctor/profile/stage3", data);
    return handleAxiosResponse(response, "SAVE_DOCTOR_PROFILE_STAGE3");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getDoctorProfileStage3() {
  try {
    const response = await axios.get("/doctor/profile/stage3");
    return handleAxiosResponse(response, "GET_DOCTOR_PROFILE_STAGE3");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveDoctorProfileStage5(data: any) {
  try {
    const response = await axios.post("/doctor/profile/stage5", data);
    return handleAxiosResponse(response, "SAVE_DOCTOR_PROFILE_STAGE5");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
