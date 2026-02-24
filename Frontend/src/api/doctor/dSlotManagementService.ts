import axios from "../axios";
import { AxiosError, type AxiosResponse } from "axios";
import type { Slot } from "../../state/doctor/dSlotSlice";
import { ROUTES } from "../../constants/routes";

function handleAxiosResponse(response: AxiosResponse, service: string) {
  console.log(response);
  if (response.data) {
    return response.data;
  } else {
    throw new Error(`API connection error: Invalid response - ${service}`);
  }
}

export async function getSlots(id: string) {
  try {
    const response = await axios.get(
      ROUTES.SLOT.GET_SLOTS.replace(":doctorId", id),
    );
    return handleAxiosResponse(response, "GET_SLOTS");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to fetch slots");
    }
  }
}

export async function getFullCalendarSlots(data: {
  doctorId: string;
  startDate: string;
  days: number;
}) {
  try {
    const response = await axios.post(
      ROUTES.SLOT.GET_FULL_CALENDAR_SLOTS,
      data,
    );
    return handleAxiosResponse(response, "GET_FULL_CALENDAR_SLOTS");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch full calendar slots",
      );
    }
  }
}

export async function createSlot(slotData: Omit<Slot, "id">) {
  try {
    const response = await axios.post(ROUTES.SLOT.CREATE_SLOT, slotData);
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
    const response = await axios.post(
      ROUTES.SLOT.CREATE_RECURRING_SLOTS,
      slotData,
    );
    return handleAxiosResponse(response, "CREATE_RECURRING_SLOTS");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to create recurring slots",
      );
    }
  }
}

export async function editSlot(slotData: Slot) {
  try {
    const response = await axios.patch(ROUTES.SLOT.EDIT_SLOT, slotData);
    return handleAxiosResponse(response, "EDIT_SLOT");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to edit slot");
    }
  }
}

export async function deleteSlot(slotId: string) {
  try {
    const response = await axios.delete(
      ROUTES.SLOT.DELETE_SLOT.replace(":id", slotId),
    );
    return handleAxiosResponse(response, "DELETE_SLOT");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to delete slot");
    }
  }
}
