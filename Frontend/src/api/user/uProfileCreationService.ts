import { ROUTES } from "../../constants/routes";
import axios from "../axios";
import { AxiosError, type AxiosResponse } from "axios";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function saveUserProfileStage1(data: any) {
  try {
    const response = await axios.patch(ROUTES.USER.SAVE_PROFILE_STAGE_1, data);
    return handleAxiosResponse(response, "SAVE_USER_PROFILE_1");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveUserProfileStage2(data: any) {
  try {
    const response = await axios.patch(ROUTES.USER.SAVE_PROFILE_STAGE_2, data);
    return handleAxiosResponse(response, "SAVE_USER_PROFILE_2");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveUserProfileStage3(data: any) {
  try {
    const response = await axios.patch(ROUTES.USER.SAVE_PROFILE_STAGE_3, data);
    return handleAxiosResponse(response, "SAVE_USER_PROFILE_3");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveUserProfileStage4(data: any) {
  try {
    const response = await axios.patch(ROUTES.USER.SAVE_PROFILE_STAGE_4, data);
    return handleAxiosResponse(response, "SAVE_USER_PROFILE_4");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getUserProfileStage1() {
  try {
    const response = await axios.get(ROUTES.USER.GET_PROFILE_STAGE_1);
    return handleAxiosResponse(response, "GET_USER_PROFILE_1");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getUserProfileStage2() {
  try {
    const response = await axios.get(ROUTES.USER.GET_PROFILE_STAGE_2);
    return handleAxiosResponse(response, "GET_USER_PROFILE_2");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getUserProfileStage3() {
  try {
    const response = await axios.get(ROUTES.USER.GET_PROFILE_STAGE_3);
    return handleAxiosResponse(response, "GET_USER_PROFILE_3");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getUserProfileStage4() {
  try {
    const response = await axios.get(ROUTES.USER.GET_PROFILE_STAGE_4);
    return handleAxiosResponse(response, "GET_USER_PROFILE_4");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getFullUserProfile() {
  try {
    const response = await axios.get(ROUTES.USER.GET_FULL_PROFILE);
    return handleAxiosResponse(response, "GET_FULL_USER_PROFILE");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
