import { IGetAdminDisputesUseCase } from "../../../domain/interfaces/usecases/disputes/IGetAdminDisputesUseCase";
import { IDisputeRepository } from "../../../domain/interfaces/repositories/IDisputeRepository";
import {
  GetAdminDisputesRequestDTO,
  GetAdminDisputesResponseDTO,
} from "../../DTOs/dispute/disputeDTOs";

export class GetAdminDisputesUseCase implements IGetAdminDisputesUseCase {
  constructor(private readonly _disputeRepository: IDisputeRepository) {}

  async execute(
    query: GetAdminDisputesRequestDTO,
  ): Promise<GetAdminDisputesResponseDTO> {
    const result = await this._disputeRepository.findAllWithFilters(query);
    return {
      disputes: result.disputes.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
