import { Roles } from "../enums/roles";

export default class Auth {
  private _id: string | null;
  private _name: string | null;
  private _email: string | null;
  private _passwordHash?: string | null;
  private _googleId?: string | null;
  private _profileId?: string | null;
  private _profileModel: string;
  private _role: Roles;
  private _isNewUser: boolean;
  private _onboardingStep: number;
  private _isBlocked: boolean;
  private _isBookingBlocked: boolean;
  private _suspensionStatus: "none" | "suspended" | "banned";
  private _suspensionStart: Date | null;
  private _suspensionEnd: Date | null;
  private _suspensionReason: string | null;
  private _suspendedBy: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id?: string;
    name: string;
    email: string;
    passwordHash?: string | null;
    googleId?: string | null;
    profileId?: string | null;
    profileModel: string;
    role: Roles;
    isBlocked: boolean;
    isNewUser: boolean;
    onboardingStep: number;
    isBookingBlocked?: boolean;
    suspensionStatus?: "none" | "suspended" | "banned";
    suspensionStart?: Date | null;
    suspensionEnd?: Date | null;
    suspensionReason?: string | null;
    suspendedBy?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id ?? null;
    this._name = params.name;
    this._email = params.email;
    if (params.passwordHash) {
      this._passwordHash = params.passwordHash;
    }
    if (params.googleId) {
      this._googleId = params.googleId;
    }
    if (params.profileId) {
      this._profileId = params.profileId;
    }
    this._profileModel = params.profileModel;
    this._role = params.role;
    this._isBlocked = params.isBlocked ?? false;
    this._isNewUser = params.isNewUser ?? true;
    this._onboardingStep = params.onboardingStep ?? 0;
    this._isBookingBlocked = params.isBookingBlocked ?? false;
    this._suspensionStatus = params.suspensionStatus ?? "none";
    this._suspensionStart = params.suspensionStart ?? null;
    this._suspensionEnd = params.suspensionEnd ?? null;
    this._suspensionReason = params.suspensionReason ?? null;
    this._suspendedBy = params.suspendedBy ?? null;
    this._createdAt = params.createdAt ?? new Date();
    this._updatedAt = params.updatedAt ?? new Date();
  }

  public get id(): string | null {
    return this._id;
  }
  public get name(): string | null {
    return this._name;
  }
  public set name(value: string | null) {
    this._name = value;
  }
  public get email(): string | null {
    return this._email;
  }
  public get passwordHash(): string | null {
    return this._passwordHash ?? null;
  }
  public get googleId(): string | null {
    return this._googleId ?? null;
  }
  public get profileId(): string | null {
    return this._profileId ?? null;
  }
  public get profileModel(): string {
    return this._profileModel;
  }
  public get role(): Roles {
    return this._role;
  }
  public get onboardingStep(): number {
    return this._onboardingStep;
  }
  public get isBlocked(): boolean {
    return this._isBlocked;
  }
  public get isNewUser(): boolean {
    return this._isNewUser;
  }
  public get isBookingBlocked(): boolean {
    return this._isBookingBlocked;
  }
  public set isBookingBlocked(value: boolean) {
    this._isBookingBlocked = value;
    this._updatedAt = new Date();
  }
  public get suspensionStatus(): "none" | "suspended" | "banned" {
    return this._suspensionStatus;
  }
  public set suspensionStatus(value: "none" | "suspended" | "banned") {
    this._suspensionStatus = value;
    this._updatedAt = new Date();
  }
  public get suspensionStart(): Date | null {
    return this._suspensionStart;
  }
  public set suspensionStart(value: Date | null) {
    this._suspensionStart = value;
    this._updatedAt = new Date();
  }
  public get suspensionEnd(): Date | null {
    return this._suspensionEnd;
  }
  public set suspensionEnd(value: Date | null) {
    this._suspensionEnd = value;
    this._updatedAt = new Date();
  }
  public get suspensionReason(): string | null {
    return this._suspensionReason;
  }
  public set suspensionReason(value: string | null) {
    this._suspensionReason = value;
    this._updatedAt = new Date();
  }
  public get suspendedBy(): string | null {
    return this._suspendedBy;
  }
  public set suspendedBy(value: string | null) {
    this._suspendedBy = value;
    this._updatedAt = new Date();
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public set profileId(profileId: string) {
    this._profileId = profileId;
  }

  public set passwordHash(passwordHash: string) {
    this._passwordHash = passwordHash;
  }

  public set isNewUser(isNewUser: boolean) {
    this._isNewUser = isNewUser;
  }

  public set onboardingStep(onboardingStep: number) {
    this._onboardingStep = onboardingStep;
  }

  public block() {
    this._isBlocked = true;
    this._updatedAt = new Date();
  }

  public unblock() {
    this._isBlocked = false;
    this._updatedAt = new Date();
  }
}
