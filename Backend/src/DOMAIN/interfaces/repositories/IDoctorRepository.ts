import { User } from "../../entities/user";

export interface IDoctorRepository {
  findByEmail(email: string): Promise<User>;
  createUser(name: string, email: string, passwordHash: string): Promise<void>;
}
