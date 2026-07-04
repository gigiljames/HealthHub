export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  deleteById(id: string): Promise<void>;
}
