export interface IUnblockHospitalUsecase {
  execute(id: string): Promise<void>;
}
