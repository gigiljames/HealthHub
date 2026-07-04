export interface IAdminUpdateOrganizationStatusUsecase {
  execute(
    id: string,
    action: "approve" | "reject" | "block" | "unblock",
    rejectionReason?: string
  ): Promise<void>;
}
