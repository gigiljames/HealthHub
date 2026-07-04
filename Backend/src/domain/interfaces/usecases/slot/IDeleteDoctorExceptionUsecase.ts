export interface IDeleteDoctorExceptionUsecase {
  execute(id: string): Promise<string>;
}
