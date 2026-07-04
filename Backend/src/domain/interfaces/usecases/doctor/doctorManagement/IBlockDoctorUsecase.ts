export interface IBlockDoctorUsecase {
  execute(id: string): Promise<void>;
}
