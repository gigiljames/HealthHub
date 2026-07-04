import { DoctorDayScheduleDTO } from "../../../../application/DTOs/doctor/DoctorDashboardDTO";

export interface IGetDoctorDayScheduleUseCase {
  execute(doctorId: string, date: Date): Promise<DoctorDayScheduleDTO>;
}
