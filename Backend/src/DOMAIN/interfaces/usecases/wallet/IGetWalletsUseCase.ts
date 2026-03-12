export interface IGetWalletsUseCase {
  execute(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    minBalance?: number;
    maxBalance?: number;
  }): Promise<{ wallets: any[]; totalPages: number; total: number }>;
}
