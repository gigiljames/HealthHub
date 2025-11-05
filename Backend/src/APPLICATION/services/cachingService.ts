import { ICachingService } from "../../domain/interfaces/services/ICachingService";
import NodeCache from "node-cache";

export class CachingService implements ICachingService {
  private _service: NodeCache;
  constructor() {
    this._service = new NodeCache();
  }
  setData<T>(key: string, value: T, ttl: number): void {
    this._service.set(key, value, ttl);
  }
  getData<T>(key: string): T | null {
    return this._service.get(key) ?? null;
  }
}
