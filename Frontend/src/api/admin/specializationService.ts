import { AxiosError, type AxiosResponse } from "axios";
import axios from "../axios";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function getSpecializations(
  search: string,
  page: number,
  limit: number,
  sort: string
) {
  try {
    const response = await axios.get(
      `/admin/specializations?search=${search}&page=${page}&limit=${limit}&sort=${sort}`
    );
    return handleAxiosResponse(response, "GET_SPECIALIZATIONS");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function addSpecialization(name: string, description: string) {
  try {
    const response = await axios.post("/admin/specialization", {
      name,
      description,
    });
    return handleAxiosResponse(response, "ADD_SPECIALIZATION");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function activateSpecialization(id: string) {
  try {
    const response = await axios.patch(`/admin/specialization/activate/${id}`);
    return handleAxiosResponse(response, "ACTIVATE_SPECIALIZATION");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function deActivateSpecialization(id: string) {
  try {
    const response = await axios.patch(
      `/admin/specialization/deactivate/${id}`
    );
    return handleAxiosResponse(response, "DEACTIVATE_SPECIALIZATION");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}

export async function editSpecialization(
  id: string,
  name: string,
  description: string
) {
  try {
    const response = await axios.patch(`/admin/specialization/${id}`, {
      name,
      description,
    });
    return handleAxiosResponse(response, "EDIT_SPECIALIZATION");
  } catch (error) {
    if (error instanceof AxiosError) {
      return error.response?.data;
    }
  }
}
