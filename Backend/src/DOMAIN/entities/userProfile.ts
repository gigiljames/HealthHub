import { BloodGroup } from "../enums/bloodGroup";
import { Gender } from "../enums/gender";
import { MaritalStatus } from "../enums/maritalStatus";
import { BodyMetrics } from "../types/bodyMetricsType";
import { Contact } from "../types/contactType";
import { Diseases } from "../types/diseasesType";
import { Surgery } from "../types/surgeryType";

export default class UserProfile {
  private _id: string;
  private _userId: string;
  private _bloodGroup: BloodGroup | null;
  private _maritalStatus: MaritalStatus | null;
  private _dob: Date | null;
  private _gender: Gender | null;
  private _occupation: string;
  private _profileImageUrl: string;
  private _allergies: string[];
  private _bodyMetrics: BodyMetrics | null;
  private _contact: Contact | null;
  private _pastDiseases: Diseases | null;
  private _pastSurgeries: Surgery[] | null;
  private _createdAt: Date;
  private _updatedAt: Date;
  constructor(params: {
    id?: string;
    userId: string;
    bloodGroup?: BloodGroup;
    maritalStatus?: MaritalStatus;
    dob?: Date;
    gender?: Gender;
    occupation?: string;
    profileImageUrl?: string;
    allergies?: string[];
    bodyMetrics?: BodyMetrics;
    contact?: Contact;
    pastDiseases?: Diseases;
    pastSurgeries?: Surgery[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id;
    this._userId = params.userId;
    this._allergies = params.allergies ?? [];
    this._bloodGroup = params.bloodGroup ?? null;
    this._bodyMetrics = params.bodyMetrics ?? null;
    this._contact = params.contact ?? null;
    this._dob = params.dob ?? null;
    this._gender = params.gender ?? null;
    this._maritalStatus = params.maritalStatus ?? null;
    this._occupation = params.occupation ?? "";
    this._pastDiseases = params.pastDiseases ?? null;
    this._pastSurgeries = params.pastSurgeries ?? null;
    this._profileImageUrl = params.profileImageUrl ?? null;
    this._createdAt = params.createdAt ?? new Date();
    this._updatedAt = params.updatedAt ?? new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get allergies(): string[] {
    return this._allergies;
  }

  public get bloodGroup(): BloodGroup {
    return this._bloodGroup;
  }

  public get bodyMetrics(): BodyMetrics {
    return this._bodyMetrics;
  }

  public get contact(): Contact {
    return this._contact;
  }

  public get dob(): Date {
    return this._dob;
  }

  public get gender(): Gender {
    return this._gender;
  }

  public get maritalStatus(): MaritalStatus {
    return this._maritalStatus;
  }

  public get occupation(): string {
    return this._occupation;
  }

  public get pastDiseases(): Diseases {
    return this._pastDiseases;
  }

  public get pastSurgeries(): Surgery[] {
    return this._pastSurgeries;
  }

  public get profileImageUrl(): string {
    return this._profileImageUrl;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public set id(id: string) {
    this._id = id;
  }

  public set allergies(allergies: string[]) {
    this._allergies = allergies;
  }

  public set bloodGroup(bloodGroup: BloodGroup) {
    this._bloodGroup = bloodGroup;
  }

  public set bodyMetrics(bodyMetrics: BodyMetrics) {
    this._bodyMetrics = bodyMetrics;
  }

  public set contact(contact: Contact) {
    this._contact = contact;
  }

  public set dob(dob: Date) {
    this._dob = dob;
  }

  public set gender(gender: Gender) {
    this._gender = gender;
  }

  public set maritalStatus(maritalStatus: MaritalStatus) {
    this._maritalStatus = maritalStatus;
  }

  public set occupation(occupation: string) {
    this._occupation = occupation;
  }

  public set pastDiseases(pastDiseases: Diseases) {
    this._pastDiseases = pastDiseases;
  }

  public set pastSurgeries(pastSurgeries: Surgery[]) {
    this._pastSurgeries = pastSurgeries;
  }

  public set profileImageUrl(profileImageUrl: string) {
    this._profileImageUrl = profileImageUrl;
  }
}
