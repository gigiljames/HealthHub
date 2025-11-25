export interface IGetAccessSignedUrlUsecase {
  execute(key: string): Promise<string>;
}
