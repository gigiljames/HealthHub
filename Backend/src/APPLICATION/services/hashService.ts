import { IHashService } from "../../DOMAIN/interfaces/services/IHashService";
import bcrypt from "bcryptjs";

export class HashService implements IHashService {
  constructor() {}
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
  async compare(password: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }
}
