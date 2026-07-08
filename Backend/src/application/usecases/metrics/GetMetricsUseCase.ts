import { IGetMetricsUseCase } from "../../../domain/interfaces/usecases/metrics/IGetMetricsUseCase";
import { register } from "../../../presentation/middlewares/metricsMiddleware";
import { GetMetricsResponseDTO } from "../../DTOs/metrics/metricsDTO";
import { MetricsMapper } from "../../mappers/metricsMapper";

export class GetMetricsUseCase implements IGetMetricsUseCase {
  async execute(): Promise<GetMetricsResponseDTO> {
    const metricsData = await register.metrics();
    const contentType = register.contentType;

    return MetricsMapper.toGetMetricsResponseDTO(metricsData, contentType);
  }
}
