import DoctorProfile from "../../../../../domain/entities/doctorProfile";

export interface IDSaveSignatureUseCase {
  execute(doctorId: string, signatureKey: string): Promise<DoctorProfile>;
}
