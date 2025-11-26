export interface IBlockHospitalUsecase {
  execute(id: string): Promise<void>;
}
