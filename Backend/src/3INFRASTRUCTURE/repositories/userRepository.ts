import { IUserRepository } from "../../1DOMAIN/interfaces/repositories/IUserRepository";

export class UserRepository implements IUserRepository {
  async userExists(email: string): Promise<boolean> {
    return false;
  }
}
