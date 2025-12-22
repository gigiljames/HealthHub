export interface IVerifyHospitalUsecase {
  execute(
    id: string,
    isApproved: boolean,
    verificationRemarks: string
  ): Promise<boolean>;
}
