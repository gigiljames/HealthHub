import axios from "../axios";
import { AxiosError, type AxiosResponse } from "axios";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function saveUserProfileStage1(data) {
  try {
    const response = await axios.patch("/profile-creation-1", data);
    return handleAxiosResponse(response, "SAVE_USER_PROFILE_1");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveUserProfileStage2(data) {
  try {
    const response = await axios.patch("/profile-creation-2", data);
    return handleAxiosResponse(response, "SAVE_USER_PROFILE_2");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveUserProfileStage3(data) {
  try {
    const response = await axios.patch("/profile-creation-3", data);
    return handleAxiosResponse(response, "SAVE_USER_PROFILE_3");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveUserProfileStage4(data) {
  try {
    const response = await axios.patch("/profile-creation-4", data);
    return handleAxiosResponse(response, "SAVE_USER_PROFILE_4");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getUserProfileStage1() {
  try {
    const response = await axios.get("/profile-creation-1");
    return handleAxiosResponse(response, "GET_USER_PROFILE_1");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getUserProfileStage2() {
  try {
    const response = await axios.get("/profile-creation-2");
    return handleAxiosResponse(response, "GET_USER_PROFILE_2");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getUserProfileStage3() {
  try {
    const response = await axios.get("/profile-creation-3");
    return handleAxiosResponse(response, "GET_USER_PROFILE_3");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getUserProfileStage4() {
  try {
    const response = await axios.get("/profile-creation-4");
    return handleAxiosResponse(response, "GET_USER_PROFILE_4");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
