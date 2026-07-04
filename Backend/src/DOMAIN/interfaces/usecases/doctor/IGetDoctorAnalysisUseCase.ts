import { DoctorAnalysisDTO } from "../../../../application/DTOs/doctor/doctorAnalysisDTO";
import { TimePeriod } from "../../../enums/timePeriod";

export interface IGetDoctorAnalysisUseCase {
  execute(
    doctorId: string,
    locationId: string | null,
    period: TimePeriod,
    duration?: number,
  ): Promise<DoctorAnalysisDTO>;
}
