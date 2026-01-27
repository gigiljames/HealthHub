export interface IDResubmitProfileUsecase {
  execute(doctorId: string): Promise<void>;
}
