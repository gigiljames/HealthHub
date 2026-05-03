import { DoctorAnalysisDTO } from "../../../dtos/doctorAnalysisDTO";
import { TimePeriod } from "../../../enums/timePeriod";

export interface IGetDoctorAnalysisUseCase {
  execute(
    doctorId: string,
    locationId: string | null,
    period: TimePeriod,
  ): Promise<DoctorAnalysisDTO>;
}
