export interface doctorExceptionDTO {
  id?: string;
  doctorId?: string;
  reason: string;
  startDatetime: string;
  endDatetime: string;
}

export interface createDoctorExceptionRequestDTO {
  reason: string;
  startDatetime: string;
  endDatetime: string;
}

export interface getDoctorExceptionsRequestDTO {
  doctorId: string;
  startDate?: string;
  endDate?: string;
}
