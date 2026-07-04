import { AxiosError, type AxiosResponse } from "axios";
import axiosInstance from "../axios";
import { ROUTES } from "../../constants/routes";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function listOrganizations() {
  try {
    const response = await axiosInstance.get(
      ROUTES.ORGANIZATION.LIST_ORGANIZATIONS,
    );
    return handleAxiosResponse(response, "LIST_ORGANIZATIONS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function enrolOrganization(data: any) {
  try {
    const response = await axiosInstance.post(
      ROUTES.ORGANIZATION.ENROL_ORGANIZATION,
      data
    );
    return handleAxiosResponse(response, "ENROL_ORGANIZATION");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function confirmEnrolment(data: any) {
  try {
    const response = await axiosInstance.post(
      ROUTES.ORGANIZATION.CONFIRM_ENROLMENT,
      data
    );
    return handleAxiosResponse(response, "CONFIRM_ENROLMENT");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function sendStatusOtp(email: string) {
  try {
    const response = await axiosInstance.post(
      ROUTES.ORGANIZATION.SEND_STATUS_OTP,
      { email }
    );
    return handleAxiosResponse(response, "SEND_STATUS_OTP");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function checkStatus(email: string, otp: string) {
  try {
    const response = await axiosInstance.post(
      ROUTES.ORGANIZATION.CHECK_STATUS,
      { email, otp }
    );
    return handleAxiosResponse(response, "CHECK_STATUS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function resubmitEnrolment(data: any) {
  try {
    const response = await axiosInstance.post(
      ROUTES.ORGANIZATION.RESUBMIT_ENROLMENT,
      data
    );
    return handleAxiosResponse(response, "RESUBMIT_ENROLMENT");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getOrganizationByCode(code: string, type?: string) {
  try {
    let url = ROUTES.ORGANIZATION.GET_ORGANIZATION_BY_CODE.replace(":code", code);
    if (type) {
      url += `?type=${encodeURIComponent(type)}`;
    }
    const response = await axiosInstance.get(url);
    return handleAxiosResponse(response, "GET_ORGANIZATION_BY_CODE");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function adminListOrganizations(params: any) {
  try {
    const response = await axiosInstance.get(
      ROUTES.ORGANIZATION.ADMIN_LIST_ORGANIZATIONS,
      { params }
    );
    return handleAxiosResponse(response, "ADMIN_LIST_ORGANIZATIONS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function adminGetOrganizationById(id: string) {
  try {
    const url = ROUTES.ORGANIZATION.ADMIN_GET_ORGANIZATION_BY_ID.replace(":id", id);
    const response = await axiosInstance.get(url);
    return handleAxiosResponse(response, "ADMIN_GET_ORGANIZATION_BY_ID");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function adminUpdateOrganizationStatus(id: string, action: string, rejectionReason?: string) {
  try {
    const url = ROUTES.ORGANIZATION.ADMIN_UPDATE_ORGANIZATION_STATUS.replace(":id", id);
    const response = await axiosInstance.patch(url, { action, rejectionReason });
    return handleAxiosResponse(response, "ADMIN_UPDATE_ORGANIZATION_STATUS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getOrganizationById(id: string) {
  try {
    const url = ROUTES.ORGANIZATION.GET_ORGANIZATION_PROFILE.replace(":id", id);
    const response = await axiosInstance.get(url);
    return handleAxiosResponse(response, "GET_ORGANIZATION_PROFILE");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
