export interface IUnblockDoctorUsecase {
  execute(id: string): Promise<void>;
}
