export interface IPreviewCancelAppointmentUseCase {
  execute(
    appointmentId: string,
    patientId: string,
  ): Promise<{
    refundAmount: number;
    refundPercentage: number;
    expiresAt: Date | null;
  }>;
}
