import { HospitalCertificate } from "../types/hospitalCertificateType";
import { HospitalContact } from "../types/hospitalContactType";

export class HospitalProfile {
  private _id?: string;
  private _hospitalId?: string;
  private _name?: string;
  private _type?: string;
  private _location?: number[];
  private _profileImageUrl?: string;
  private _bannerImageUrl?: string;
  private _certificates?: HospitalCertificate;
  private _createdAt?: Date;
  private _updatedAt?: Date;
  private _features?: string[];
  private _contact?: HospitalContact;
  private _isVisible?: boolean;
  private _lastUpdated?: Date;
  private _verificationStatus?: string;
  private _verificationRemarks?: string;

  constructor(params: Partial<HospitalProfile>) {
    Object.assign(this, params);
  }

  // 🧩 Getters and Setters
  get id(): string | undefined {
    return this._id;
  }
  set id(value: string | undefined) {
    this._id = value;
  }

  get hospitalId(): string | undefined {
    return this._hospitalId;
  }
  set hospitalId(value: string | undefined) {
    this._hospitalId = value;
  }

  get name(): string | undefined {
    return this._name;
  }
  set name(value: string | undefined) {
    this._name = value;
  }

  get type(): string | undefined {
    return this._type;
  }
  set type(value: string | undefined) {
    this._type = value;
  }

  get location(): number[] | undefined {
    return this._location;
  }
  set location(value: number[] | undefined) {
    this._location = value;
  }

  get profileImageUrl(): string | undefined {
    return this._profileImageUrl;
  }
  set profileImageUrl(value: string | undefined) {
    this._profileImageUrl = value;
  }

  get bannerImageUrl(): string | undefined {
    return this._bannerImageUrl;
  }
  set bannerImageUrl(value: string | undefined) {
    this._bannerImageUrl = value;
  }

  get certificates(): HospitalCertificate | undefined {
    return this._certificates;
  }
  set certificates(value: HospitalCertificate | undefined) {
    this._certificates = value;
  }

  get createdAt(): Date | undefined {
    return this._createdAt;
  }
  set createdAt(value: Date | undefined) {
    this._createdAt = value;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt;
  }
  set updatedAt(value: Date | undefined) {
    this._updatedAt = value;
  }

  get features(): string[] | undefined {
    return this._features;
  }
  set features(value: string[] | undefined) {
    this._features = value;
  }

  get contact(): HospitalContact | undefined {
    return this._contact;
  }
  set contact(value: HospitalContact | undefined) {
    this._contact = value;
  }

  get isVisible(): boolean | undefined {
    return this._isVisible;
  }
  set isVisible(value: boolean | undefined) {
    this._isVisible = value;
  }

  get lastUpdated(): Date | undefined {
    return this._lastUpdated;
  }
  set lastUpdated(value: Date | undefined) {
    this._lastUpdated = value;
  }

  get verificationStatus(): string | undefined {
    return this._verificationStatus;
  }
  set verificationStatus(value: string | undefined) {
    this._verificationStatus = value;
  }

  get verificationRemarks(): string | undefined {
    return this._verificationRemarks;
  }
  set verificationRemarks(value: string | undefined) {
    this._verificationRemarks = value;
  }
}
