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

export async function getSlots(id: string, startDate: string, endDate: string) {
  try {
    const response = await axios.get(
      ROUTES.SLOT.GET_SLOTS.replace(":doctorId", id),
      { params: { startDate, endDate } },
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

export async function blockSlot(id: string) {
  try {
    const response = await axios.patch(
      ROUTES.SLOT.BLOCK_SLOT.replace(":id", id),
    );
    return handleAxiosResponse(response, "BLOCK_SLOT");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to block slot");
    }
  }
}

export async function unblockSlot(id: string) {
  try {
    const response = await axios.patch(
      ROUTES.SLOT.UNBLOCK_SLOT.replace(":id", id),
    );
    return handleAxiosResponse(response, "UNBLOCK_SLOT");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to unblock slot",
      );
    }
  }
}

// Schedule Rules
export async function getScheduleRules(doctorId: string) {
  try {
    const response = await axios.get(
      ROUTES.SCHEDULE_RULE.GET_RULES.replace(":doctorId", doctorId),
    );
    return handleAxiosResponse(response, "GET_SCHEDULE_RULES");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to fetch rules");
    }
  }
}

export async function createScheduleRule(data: any) {
  try {
    const response = await axios.post(ROUTES.SCHEDULE_RULE.CREATE_RULE, data);
    return handleAxiosResponse(response, "CREATE_SCHEDULE_RULE");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to create rule");
    }
  }
}

export async function editScheduleRule(id: string, data: any) {
  try {
    const response = await axios.patch(
      ROUTES.SCHEDULE_RULE.EDIT_RULE.replace(":id", id),
      data,
    );
    return handleAxiosResponse(response, "EDIT_SCHEDULE_RULE");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to edit rule");
    }
  }
}

export async function deleteScheduleRule(id: string) {
  try {
    const response = await axios.delete(
      ROUTES.SCHEDULE_RULE.DELETE_RULE.replace(":id", id),
    );
    return handleAxiosResponse(response, "DELETE_SCHEDULE_RULE");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to delete rule");
    }
  }
}

export async function toggleScheduleRule(id: string) {
  try {
    const response = await axios.patch(
      ROUTES.SCHEDULE_RULE.TOGGLE_RULE.replace(":id", id),
    );
    return handleAxiosResponse(response, "TOGGLE_SCHEDULE_RULE");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Failed to toggle rule");
    }
  }
}

// Doctor Exceptions
export async function getDoctorExceptions(doctorId: string) {
  try {
    const response = await axios.get(
      ROUTES.DOCTOR_EXCEPTION.GET_EXCEPTIONS.replace(":doctorId", doctorId),
    );
    return handleAxiosResponse(response, "GET_DOCTOR_EXCEPTIONS");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch exceptions",
      );
    }
  }
}

export async function createDoctorException(data: any) {
  try {
    const response = await axios.post(
      ROUTES.DOCTOR_EXCEPTION.CREATE_EXCEPTION,
      data,
    );
    return handleAxiosResponse(response, "CREATE_DOCTOR_EXCEPTION");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to create exception",
      );
    }
  }
}

export async function deleteDoctorException(id: string) {
  try {
    const response = await axios.delete(
      ROUTES.DOCTOR_EXCEPTION.DELETE_EXCEPTION.replace(":id", id),
    );
    return handleAxiosResponse(response, "DELETE_DOCTOR_EXCEPTION");
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || "Failed to delete exception",
      );
    }
  }
}
