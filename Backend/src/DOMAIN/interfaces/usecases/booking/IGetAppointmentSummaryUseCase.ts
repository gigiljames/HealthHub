export interface IGetAppointmentSummaryUseCase {
  execute(slotId: string): Promise<any>;
}
