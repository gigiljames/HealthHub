export interface ICachingService {
  setData<T>(key: string, value: T, ttl: number): void;
  getData<T>(key: string): T;
}
