export interface slotDTO {
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
}
