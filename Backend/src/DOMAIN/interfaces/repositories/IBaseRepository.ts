export interface IBaseRepository<T, Q> {
  findById(id: string): Promise<T>;
  // findAll(query: Q): Promise<T[]>;
  // save(entity: T): Promise<void>;
  // totalDocumentCount(query: Q): Promise<number>;
}
