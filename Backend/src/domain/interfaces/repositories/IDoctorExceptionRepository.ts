import DoctorException from "../../entities/doctorException";

export interface IDoctorExceptionRepository {
  findById(id: string): Promise<DoctorException | null>;
  deleteById(id: string): Promise<void>;
  findByDoctorId(doctorId: string): Promise<DoctorException[]>;
  findExceptionsInRange(
    doctorId: string,
    start: Date,
    end: Date,
  ): Promise<DoctorException[]>;
  save(exception: DoctorException): Promise<DoctorException>;
}
