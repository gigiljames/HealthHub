export interface IGetPayoutDetailsUseCase {
  execute(payoutId: string): Promise<any>;
}
