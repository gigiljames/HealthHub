import {
  GetAdminDisputesRequestDTO,
  GetAdminDisputesResponseDTO,
} from "../../../../application/DTOs/dispute/disputeDTOs";

export interface IGetAdminDisputesUseCase {
  execute(
    query: GetAdminDisputesRequestDTO,
  ): Promise<GetAdminDisputesResponseDTO>;
}
