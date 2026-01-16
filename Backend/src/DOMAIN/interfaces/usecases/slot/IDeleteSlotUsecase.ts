export interface IDeleteSlotUsecase {
  execute(id: string): Promise<string>;
}
