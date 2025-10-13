import { Roles } from "../enums/roles";

export default class Auth {
  private _id: string;
  private _name: string;
  private _email: string;
  private _passwordHash?: string;
  private _googleId?: string;
  private _role: Roles;
  private _isNewUser: boolean;
  private _isBlocked: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id?: string;
    name: string;
    email: string;
    passwordHash?: string;
    googleId?: string;
    role: Roles;
    isBlocked: boolean;
    isNewUser: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._name = params.name;
    this._email = params.email;
    if (params.passwordHash) {
      this._passwordHash = params.passwordHash;
    }
    if (params.googleId) {
      this._googleId = params.googleId;
    }
    this._role = params.role;
    this._isBlocked = params.isBlocked ?? false;
    this._isNewUser = params.isNewUser ?? true;
    this._createdAt = params.createdAt ?? new Date();
    this._updatedAt = params.updatedAt ?? new Date();
  }

  public get id(): string {
    return this._id;
  }
  public get name(): string {
    return this._name;
  }
  public get email(): string {
    return this._email;
  }
  public get passwordHash(): string {
    return this._passwordHash;
  }
  public get googleId(): string {
    return this._googleId;
  }
  public get role(): Roles {
    return this._role;
  }
  public get isBlocked(): boolean {
    return this._isBlocked;
  }
  public get isNewUser(): boolean {
    return this._isNewUser;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public set passwordHash(passwordHash: string) {
    this._passwordHash = passwordHash;
  }

  public set isNewUser(isNewUser: boolean) {
    this._isNewUser = isNewUser;
  }
}
