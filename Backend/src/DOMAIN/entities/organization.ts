import { OrganizationType } from "../enums/organizationType";

export class Organization {
  private _id?: string;
  private _name: string;
  private _organizationType: OrganizationType;
  private _location?: {
    type: "Point";
    coordinates: number[];
    address: string;
    placeId: string;
  };
  private _accountHolderName: string;
  private _bankName: string;
  private _accountNumber: string;
  private _ifscCode: string;
  private _upiId?: string;
  private _isVerified: boolean;
  private _isBlocked: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id?: string;
    name: string;
    organizationType: OrganizationType;
    location?: {
      type: "Point";
      coordinates: number[];
      address: string;
      placeId: string;
    };
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId?: string;
    isVerified: boolean;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._location = params.location;
    this._name = params.name;
    this._organizationType = params.organizationType;
    this._accountHolderName = params.accountHolderName;
    this._bankName = params.bankName;
    this._accountNumber = params.accountNumber;
    this._ifscCode = params.ifscCode;
    this._upiId = params.upiId;
    this._isVerified = params.isVerified;
    this._isBlocked = params.isBlocked;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  get id(): string | undefined {
    return this._id;
  }

  get location():
    | {
        type: "Point";
        coordinates: number[];
        address: string;
        placeId: string;
      }
    | undefined {
    return this._location;
  }

  get name(): string {
    return this._name;
  }

  get organizationType(): OrganizationType {
    return this._organizationType;
  }

  get accountHolderName(): string {
    return this._accountHolderName;
  }

  get bankName(): string {
    return this._bankName;
  }

  get accountNumber(): string {
    return this._accountNumber;
  }

  get ifscCode(): string {
    return this._ifscCode;
  }

  get upiId(): string | undefined {
    return this._upiId;
  }

  get isVerified(): boolean {
    return this._isVerified;
  }

  get isBlocked(): boolean {
    return this._isBlocked;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  set id(value: string | undefined) {
    this._id = value;
  }

  set location(value: {
    type: "Point";
    coordinates: number[];
    address: string;
    placeId: string;
  }) {
    this._location = value;
  }

  set name(value: string) {
    this._name = value;
  }

  set organizationType(value: OrganizationType) {
    this._organizationType = value;
  }

  set accountHolderName(value: string) {
    this._accountHolderName = value;
  }

  set bankName(value: string) {
    this._bankName = value;
  }

  set accountNumber(value: string) {
    this._accountNumber = value;
  }

  set ifscCode(value: string) {
    this._ifscCode = value;
  }

  set upiId(value: string | undefined) {
    this._upiId = value;
  }

  set isVerified(value: boolean) {
    this._isVerified = value;
  }

  set isBlocked(value: boolean) {
    this._isBlocked = value;
  }

  set createdAt(value: Date) {
    this._createdAt = value;
  }

  set updatedAt(value: Date) {
    this._updatedAt = value;
  }
}
