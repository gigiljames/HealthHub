import axiosInstance from "../axios";
import axios, { AxiosError, type AxiosResponse } from "axios";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function saveHospitalProfileStage1(data: any) {
  try {
    const response = await axiosInstance.patch(
      "/hospital/profile-creation-1",
      data
    );
    return handleAxiosResponse(response, "SAVE_HOSPITAL_PROFILE_1");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalRegistrationUploadSignedUrl(
  fileName: string,
  contentType: string
) {
  try {
    const response = await axiosInstance.post(
      "/s3/hospital/profile-registration-upload-url",
      {
        fileName,
        contentType,
      }
    );
    return handleAxiosResponse(response, "GET_HOSPITAL_REG_UPLOAD_SIGNED_URL");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalGstUploadSignedUrl(
  fileName: string,
  contentType: string
) {
  try {
    const response = await axiosInstance.post(
      "/s3/hospital/profile-gst-upload-url",
      {
        fileName,
        contentType,
      }
    );
    return handleAxiosResponse(response, "GET_HOSPITAL_GST_UPLOAD_SIGNED_URL");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function saveHospitalProfileStage2(data: any) {
  try {
    const response = await axiosInstance.patch(
      "/hospital/profile-creation-2",
      data
    );
    return handleAxiosResponse(response, "SAVE_HOSPITAL_PROFILE_2");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function saveHospitalProfileStage3(data: any) {
  try {
    const response = await axiosInstance.patch(
      "/hospital/profile-creation-3",
      data
    );
    return handleAxiosResponse(response, "SAVE_HOSPITAL_PROFILE_3");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function saveHospitalProfileStage4(data: any) {
  try {
    const response = await axiosInstance.patch(
      "/hospital/profile-creation-4",
      data
    );
    return handleAxiosResponse(response, "SAVE_HOSPITAL_PROFILE_4");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function saveHospitalProfileStage5(data: any) {
  try {
    const response = await axiosInstance.patch(
      "/hospital/profile-creation-5",
      data
    );
    return handleAxiosResponse(response, "SAVE_HOSPITAL_PROFILE_5");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalProfileStage1() {
  try {
    const response = await axiosInstance.get("/hospital/profile-creation-1");
    return handleAxiosResponse(response, "GET_HOSPITAL_PROFILE_1");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalProfileStage2() {
  try {
    const response = await axiosInstance.get("/hospital/profile-creation-2");
    return handleAxiosResponse(response, "GET_HOSPITAL_PROFILE_2");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalProfileStage3() {
  try {
    const response = await axiosInstance.get("/hospital/profile-creation-3");
    return handleAxiosResponse(response, "GET_HOSPITAL_PROFILE_3");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalProfileStage4() {
  try {
    const response = await axiosInstance.get("/hospital/profile-creation-4");
    return handleAxiosResponse(response, "GET_HOSPITAL_PROFILE_4");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getHospitalProfileStage5() {
  try {
    const response = await axiosInstance.get("/hospital/profile-creation-5");
    return handleAxiosResponse(response, "GET_HOSPITAL_PROFILE_5");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function getS3UploadUrl(
  fileName: string,
  contentType: string,
  folder: string
) {
  try {
    const response = await axiosInstance.post("/s3/get-dp-upload-url", {
      fileName,
      contentType,
      folder,
    });
    return handleAxiosResponse(response, "GET_S3_UPLOAD_URL");
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}

export async function uploadFileToS3(
  uploadUrl: string,
  file: File | Blob,
  fileType: string
) {
  try {
    const response = await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": fileType,
      },
    });
    // No JSON returned from S3 — just a 200 status
    return { success: response.status === 200 };
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}
