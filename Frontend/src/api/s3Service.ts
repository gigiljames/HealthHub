import axios from "axios";
import { AxiosError } from "axios";

export async function uploadFileToS3(
  uploadUrl: string,
  file: File | Blob,
  fileType: string,
) {
  try {
    const response = await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": fileType,
      },
    });
    return { success: response.status === 200 };
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
  }
}
