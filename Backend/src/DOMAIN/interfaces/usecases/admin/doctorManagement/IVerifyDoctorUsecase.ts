export interface IVerifyDoctorUsecase {
  execute(
    doctorId: string,
    isApproved: boolean,
    verificationRemarks: string
  ): Promise<void>;
}
