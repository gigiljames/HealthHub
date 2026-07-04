export interface scheduleRuleDTO {
  id?: string;
  doctorId?: string;
  title: string;
  practiceLocationId: string;
  mode: "online" | "in-person";
  duration: number;
  buffer: number;
  rruleString: string;
  validFrom: string;
  validTo: string | null;
  startHour: string;
  endHour: string;
  isActive?: boolean;
}

export interface createScheduleRuleRequestDTO {
  title: string;
  practiceLocationId: string;
  mode: "online" | "in-person";
  duration: number;
  buffer: number;
  rruleString: string;
  validFrom: string;
  validTo: string | null;
  startHour: string;
  endHour: string;
}

export interface editScheduleRuleRequestDTO {
  id: string;
  title?: string;
  practiceLocationId?: string;
  mode?: "online" | "in-person";
  duration?: number;
  buffer?: number;
  rruleString?: string;
  validFrom?: string;
  validTo?: string | null;
  startHour?: string;
  endHour?: string;
}

export interface getScheduleRulesRequestDTO {
  doctorId: string;
}
