import { VerifiedPrescriptionDTO } from "../../../../application/usecases/consultation/VerifyPrescriptionUseCase";

export interface IVerifyPrescriptionUseCase {
  execute(token: string): Promise<VerifiedPrescriptionDTO>;
}
