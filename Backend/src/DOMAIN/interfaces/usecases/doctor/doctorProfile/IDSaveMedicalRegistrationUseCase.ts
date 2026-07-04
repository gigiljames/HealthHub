import DoctorProfile from "../../../../../domain/entities/doctorProfile";

export interface IDSaveMedicalRegistrationUseCase {
  execute(doctorId: string, registrationNumber: string): Promise<DoctorProfile>;
}
