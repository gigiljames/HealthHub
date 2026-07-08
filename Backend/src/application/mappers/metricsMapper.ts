import { GetMetricsResponseDTO } from "../DTOs/metrics/metricsDTO";

export class MetricsMapper {
  static toGetMetricsResponseDTO(metrics: string, contentType: string): GetMetricsResponseDTO {
    return {
      metrics,
      contentType,
    };
  }
}
