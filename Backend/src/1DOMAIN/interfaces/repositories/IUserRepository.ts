export interface IUserRepository {
  userExists(email: string): Promise<boolean>;
}
