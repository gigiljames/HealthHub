import { GetMetricsResponseDTO } from "../../../../application/DTOs/metrics/metricsDTO";

export interface IGetMetricsUseCase {
  execute(): Promise<GetMetricsResponseDTO>;
}
