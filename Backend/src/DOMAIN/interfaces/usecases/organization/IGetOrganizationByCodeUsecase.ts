export interface IGetOrganizationByCodeUsecase {
  execute(code: string, type?: string): Promise<{ name: string; id: string }>;
}
