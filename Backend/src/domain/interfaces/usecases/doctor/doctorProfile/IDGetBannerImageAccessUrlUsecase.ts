export interface IDGetBannerImageAccessUrlUsecase {
  execute(doctorId: string): Promise<string>;
}
