export interface slotDTO {
  id?: string;
  title: string;
  start: string;
  end: string;
  mode: "online" | "in-person";
  isBooked: boolean;
}

export interface recurringSlotsRequestDTO {
  title: string;
  start: string;
  end: string;
  mode: "online" | "in-person";
  recurMode: "this-week" | "every-this-day" | "this-month";
}
