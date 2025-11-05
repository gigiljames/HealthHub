export default class Hospital {
  private _id: string;
  private _name: string;
  private _email: string;
  private _passwordHash: string;
  private _isNewUser: boolean;
  private _isBlocked: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    isBlocked: boolean;
    isNewUser: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._name = params.name;
    this._email = params.email;
    this._passwordHash = params.passwordHash;
    this._isBlocked = params.isBlocked ?? false;
    this._isNewUser = params.isNewUser ?? true;
    this._createdAt = params.createdAt ?? new Date();
    this._updatedAt = params.updatedAt ?? new Date();
  }
}
