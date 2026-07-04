export interface IDGetProfileImageAccessUrlUsecase {
  execute(doctorId: string): Promise<string>;
}
