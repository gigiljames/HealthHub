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

export async function getSpecializationList() {
  try {
    const response = await axios.get(ROUTES.SPECIALIZATION.GET_SPECIALIZATIONS);
    return handleAxiosResponse(response, "GET_SPECIALIZATION_LIST");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveDoctorProfileStage1(data: any) {
  try {
    const response = await axios.post(ROUTES.DOCTOR.SAVE_PROFILE_STAGE_1, data);
    return handleAxiosResponse(response, "SAVE_DOCTOR_PROFILE_STAGE1");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getDoctorProfileStage1() {
  try {
    const response = await axios.get(ROUTES.DOCTOR.GET_PROFILE_STAGE_1);
    return handleAxiosResponse(response, "GET_DOCTOR_PROFILE_STAGE1");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveDoctorProfileStage2(data: any) {
  try {
    const response = await axios.post(ROUTES.DOCTOR.SAVE_PROFILE_STAGE_2, data);
    return handleAxiosResponse(response, "SAVE_DOCTOR_PROFILE_STAGE2");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getDoctorProfileStage2() {
  try {
    const response = await axios.get(ROUTES.DOCTOR.GET_PROFILE_STAGE_2);
    return handleAxiosResponse(response, "GET_DOCTOR_PROFILE_STAGE2");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveDoctorProfileStage3(data: any) {
  try {
    const response = await axios.post(ROUTES.DOCTOR.SAVE_PROFILE_STAGE_3, data);
    return handleAxiosResponse(response, "SAVE_DOCTOR_PROFILE_STAGE3");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getDoctorProfileStage3() {
  try {
    const response = await axios.get(ROUTES.DOCTOR.GET_PROFILE_STAGE_3);
    return handleAxiosResponse(response, "GET_DOCTOR_PROFILE_STAGE3");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveDoctorOnboardingStep6(data: any) {
  try {
    const response = await axios.post(ROUTES.DOCTOR.ONBOARDING_STEP_6, data);
    return handleAxiosResponse(response, "SAVE_DOCTOR_ONBOARDING_STEP6");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getMedicalLicenseUploadSignedUrl(data: any) {
  try {
    const response = await axios.post(
      ROUTES.DOCTOR.GET_MEDICAL_LICENSE_UPLOAD_SIGNED_URL,
      data,
    );
    return handleAxiosResponse(
      response,
      "GET_MEDICAL_LICENSE_UPLOAD_SIGNED_URL",
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getDegreeCertificateUploadSignedUrl(data: any) {
  try {
    const response = await axios.post(
      ROUTES.DOCTOR.GET_DEGREE_CERTIFICATE_UPLOAD_SIGNED_URL,
      data,
    );
    return handleAxiosResponse(
      response,
      "GET_DEGREE_CERTIFICATE_UPLOAD_SIGNED_URL",
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getDoctorOnboardingStep4() {
  try {
    const response = await axios.get(ROUTES.DOCTOR.ONBOARDING_STEP_4);
    return handleAxiosResponse(response, "GET_DOCTOR_ONBOARDING_STEP4");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveDoctorOnboardingStep4(data: any) {
  try {
    const response = await axios.patch(ROUTES.DOCTOR.ONBOARDING_STEP_4, data);
    return handleAxiosResponse(response, "SAVE_DOCTOR_ONBOARDING_STEP4");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function getDoctorVerificationDocs() {
  try {
    const response = await axios.get(ROUTES.DOCTOR.GET_VERIFICATION_DOCS);
    return handleAxiosResponse(response, "GET_DOCTOR_VERIFICATION_DOCS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function saveDoctorVerificationDocs(data: any) {
  try {
    const response = await axios.patch(
      ROUTES.DOCTOR.SAVE_VERIFICATION_DOCS,
      data,
    );
    return handleAxiosResponse(response, "SAVE_DOCTOR_VERIFICATION_DOCS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function resubmitDoctorProfile() {
  try {
    const response = await axios.patch(ROUTES.DOCTOR.RESUBMIT_PROFILE);
    return handleAxiosResponse(response, "RESUBMIT_DOCTOR_PROFILE");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
