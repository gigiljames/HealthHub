export interface GetConsultationModesInputDTO {
  appointmentId: string;
}

export interface GetConsultationModesOutputDTO {
  supportedModes: string[];
}
