import { ICachingService } from "../../1DOMAIN/interfaces/services/ICachingService";
import NodeCache from "node-cache";

export class CachingService implements ICachingService {
  private service: NodeCache;
  constructor() {
    this.service = new NodeCache();
  }
  setData<T>(key: string, value: T, ttl: number): void {
    this.service.set(key, value, ttl);
  }
  getData<T>(key: string): T {
    return this.service.get(key);
  }
}
