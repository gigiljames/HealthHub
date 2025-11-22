export interface IGetHospitalRegistrationAccessSignedUrlUsecase {
  execute(hospitalId: string, fileName: string): Promise<string>;
}
