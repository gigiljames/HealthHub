import { SlotStatus } from "../../../domain/enums/slotStatus";

export interface slotDTO {
  id?: string;
  title: string;
  start: string;
  end: string;
  mode: "online" | "in-person";
  practiceLocationId: string;
  status?: SlotStatus;
  lockedUntil?: string | null;
  lockedBy?: string | null;
  appointmentId?: string | null;
  scheduleRuleId?: string | null;
  isVirtual?: boolean;
}

export interface createSlotRequestDTO {
  id?: string;
  title: string;
  start: string;
  end: string;
  mode: "online" | "in-person";
  practiceLocationId: string;
  isBooked: boolean;
}

export interface recurringSlotsRequestDTO {
  title: string;
  start: string;
  end: string;
  mode: "online" | "in-person";
  practiceLocationId: string;
  recurMode: "this-week" | "every-this-day" | "this-month";
}

export interface getSlotsRequestDTO {
  doctorId: string;
  startDate: string;
  endDate: string;
  excludePast?: boolean;
}

export interface groupedSlotsByLocationAndDateDTO {
  [practiceLocationId: string]: {
    [date: string]: slotDTO[];
  };
}

export interface groupedSlotsByDateAndLocationDTO {
  [date: string]: {
    [practiceLocationId: string]: slotDTO[];
  };
}

export interface getDoctorSlotsGroupedByLocationAndDateDTO {
  doctorId: string;
  startDate: string;
  days: number;
  future?: boolean;
}
