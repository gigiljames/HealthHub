import { GetMetricsUseCase } from "../../application/usecases/metrics/GetMetricsUseCase";
import { MetricsController } from "../controllers/MetricsController";

const getMetricsUseCase = new GetMetricsUseCase();

export const injectedMetricsController = new MetricsController(getMetricsUseCase);
