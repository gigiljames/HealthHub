export interface IGetHospitalGstAccessSignedUrlUsecase {
  execute(hospitalId: string, fileName: string): Promise<string>;
}
