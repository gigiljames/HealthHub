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

export async function googleAuth(token: string, role: string) {
  try {
    const response = await axios.post(ROUTES.AUTH.GOOGLE_AUTH, { token, role });
    return handleAxiosResponse(response, "GOOGLE_AUTH");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function signup(name: string, email: string, role: string) {
  try {
    const response = await axios.post(ROUTES.AUTH.SIGNUP, {
      name,
      email,
      role,
    });
    return handleAxiosResponse(response, "SIGNUP");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function resendOtp(name: string, email: string, role: string) {
  try {
    const response = await axios.post(ROUTES.AUTH.RESEND_OTP, {
      name,
      email,
      role,
    });
    return handleAxiosResponse(response, "RESEND_OTP");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function verifyOtp(
  name: string,
  email: string,
  password: string,
  role: string,
  otp: string
) {
  try {
    const response = await axios.post(ROUTES.AUTH.VERIFY_OTP, {
      name,
      email,
      password,
      role,
      otp,
    });
    return handleAxiosResponse(response, "VERIFY_OTP");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function login(email: string, password: string, role: string) {
  try {
    const response = await axios.post(ROUTES.AUTH.LOGIN, {
      email,
      password,
      role,
    });
    return handleAxiosResponse(response, "LOGIN");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function logout() {
  try {
    const response = await axios.post(ROUTES.AUTH.LOGOUT);
    return handleAxiosResponse(response, "LOGOUT");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function forgotPassword(email: string) {
  try {
    const response = await axios.post(ROUTES.AUTH.FORGOT_PASSWORD, { email });
    return handleAxiosResponse(response, "FORGOT_PASSWORD");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function forgotPasswordResendOtp(email: string) {
  try {
    const response = await axios.post(ROUTES.AUTH.FORGOT_PASSWORD_RESEND_OTP, {
      email,
    });
    return handleAxiosResponse(response, "FORGOT_PASSWORD_RESEND_OTP");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function forgotPasswordVerifyOtp(otp: string, email: string) {
  try {
    const response = await axios.post(ROUTES.AUTH.FORGOT_PASSWORD_VERIFY_OTP, {
      otp,
      email,
    });
    return handleAxiosResponse(response, "FORGOT_PASSWORD_VERIFY_OTP");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function resetPassword(
  password: string,
  email: string,
  token: string
) {
  try {
    const response = await axios.post(ROUTES.AUTH.RESET_PASSWORD, {
      password,
      email,
      token,
    });
    return handleAxiosResponse(response, "RESET_PASSWORD");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
