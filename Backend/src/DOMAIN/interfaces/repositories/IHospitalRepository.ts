import { User } from "../../entities/user";

export interface IHospitalRepository {
  findByEmail(email: string): Promise<User>;
  createUser(name: string, email: string, passwordHash: string): Promise<void>;
}
