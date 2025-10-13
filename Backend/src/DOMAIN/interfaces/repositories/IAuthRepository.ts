import Auth from "../../entities/auth";

export interface IAuthRepository {
  findById(id: string): Promise<Auth>;
  findByEmail(email: string): Promise<Auth>;
  save(auth: Auth): Promise<void>;
}
