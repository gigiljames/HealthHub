import axios from "../axios";
import { AxiosError, type AxiosResponse } from "axios";
import type { Slot } from "../../state/doctor/dSlotSlice";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  console.log(response);
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function getSlots() {
  try {
    const response = await axios.get("/doctor/slots");
    return handleAxiosResponse(response, "GET_SLOTS");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to fetch slots");
    }
  }
}

export async function createSlot(slotData: Omit<Slot, "id">) {
  try {
    const response = await axios.post("/doctor/slot", slotData);
    return handleAxiosResponse(response, "CREATE_SLOT");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to create slot");
    }
  }
}

export async function createRecurringSlots(slotData: {
  title: string;
  start: string;
  end: string;
  mode: string;
  recurMode: string;
}) {
  try {
    const response = await axios.post("/doctor/slot/recurring", slotData);
    return handleAxiosResponse(response, "CREATE_RECURRING_SLOTS");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to create recurring slots"
      );
    }
  }
}

export async function editSlot(slotData: Slot) {
  try {
    const response = await axios.patch("/doctor/slot", slotData);
    return handleAxiosResponse(response, "EDIT_SLOT");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to edit slot");
    }
  }
}

export async function deleteSlot(slotId: string) {
  try {
    const response = await axios.delete(`/doctor/slot/${slotId}`);
    return handleAxiosResponse(response, "DELETE_SLOT");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to delete slot");
    }
  }
}
