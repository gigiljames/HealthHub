import Auth from "../../entities/auth";

export interface IAuthRepository {
  findById(id: string): Promise<Auth | null>;
  findByEmail(email: string): Promise<Auth | null>;
  save(auth: Auth): Promise<Auth>;
}
