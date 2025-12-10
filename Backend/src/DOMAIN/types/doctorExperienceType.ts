import { DoctorWorkType } from "../enums/doctorWorkTypes";

export type DoctorExperience = {
  designation: string;
  hospital: string;
  description?: string;
  location: string;
  present: boolean;
  startDate: {
    month: number;
    year: number;
  };
  endDate?: {
    month: number;
    year: number;
  };
  type: DoctorWorkType;
};
