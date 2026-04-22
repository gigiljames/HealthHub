import {
  DemographicRaw,
  SpecializationTrendRaw,
} from "../../../domain/interfaces/repositories/adminDashboardRepositoryTypes";
import {
  DemographicsData,
  SpecializationData,
} from "../../DTOs/admin/dashboardDTOs";

export class DashboardMapper {
  static toDemographicsDTO(data: DemographicRaw[]): DemographicsData[] {
    const total = data.reduce((acc, curr) => acc + curr.count, 0);
    return data.map((item) => ({
      label: item.label || "Unknown",
      count: item.count,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));
  }

  static toSpecializationDTO(
    data: SpecializationTrendRaw[],
  ): SpecializationData[] {
    const total = data.reduce((acc, curr) => acc + curr.count, 0);
    return data.map((item) => ({
      name: item.name,
      count: item.count,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
    }));
  }

  static calculateRate(part: number, total: number): number {
    return total > 0 ? (part / total) * 100 : 0;
  }
}
