import { Gender } from "../enums/gender";
import { PracticeType } from "../enums/practiceType";
import { VerificationStatus } from "../enums/verificationStatus";
import { DoctorEducation } from "../types/doctorEducationType";
import { DoctorExperience } from "../types/doctorExperienceType";
import { PopulatedPracticeLocation } from "../types/populatedPracticeLocation";
import { PracticeLocation } from "../types/practiceLocation";
import { VerificationSubmission } from "../types/verificationSubmission";
import Auth from "./auth";
import Specialization from "./specialization";

export interface DoctorCertificates {
  latestDegree: string;
  medicalLicence: string;
}

export interface DoctorProfilePopulated {
  // auth, specialization, organization populated
  id: string;
  doctorId: Auth;
  profileImageUrl: string;
  bannerImageUrl: string;
  dob?: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  about?: string;
  independentFee?: number;
  education: DoctorEducation[];
  experience: DoctorExperience[];
  specialization?: Specialization;
  certificates: DoctorCertificates;
  practiceType?: PracticeType;
  hospitalId?: string;
  practiceLocations: PopulatedPracticeLocation[];
  verificationStatus?: VerificationStatus;
  activeSubmissionId: string | null;
  verificationSubmissions: VerificationSubmission[];
  acceptedTerms?: boolean;
  submissionDate?: Date;
  isVisible: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorProfileSpecializationPopulated {
  // specialization populated
  id: string;
  doctorId: string;
  profileImageUrl: string;
  bannerImageUrl: string;
  dob?: Date;
  gender: Gender;
  phone?: string;
  address?: string;
  about?: string;
  independentFee?: number;
  education: DoctorEducation[];
  experience: DoctorExperience[];
  specialization?: Specialization;
  certificates: DoctorCertificates;
  practiceType?: PracticeType;
  hospitalId?: string;
  practiceLocations: PracticeLocation[];
  verificationStatus?: VerificationStatus;
  activeSubmissionId: string | null;
  verificationSubmissions: VerificationSubmission[];
  acceptedTerms?: boolean;
  submissionDate?: Date;
  isVisible: boolean;
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export default class DoctorProfile {
  private _id: string | null;
  private _doctorId: string;
  private _profileImageUrl: string;
  private _bannerImageUrl: string;
  private _dob?: Date;
  private _gender: Gender;
  private _phone?: string;
  private _address?: string;
  private _about?: string;
  private _independentFee?: number;
  private _education: DoctorEducation[];
  private _experience: DoctorExperience[];
  private _specialization?: string | Specialization;
  private _certificates: DoctorCertificates;
  private _practiceType?: PracticeType;
  private _practiceLocations: PracticeLocation[];
  private _hospitalId?: string;
  private _verificationStatus?: VerificationStatus;
  private _verificationSubmissions: VerificationSubmission[];
  private _activeSubmissionId: string | null;
  private _acceptedTerms?: boolean;
  private _submissionDate?: Date;
  private _isVisible: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: Partial<DoctorProfile>) {
    this._id = params.id ?? null;
    this._doctorId = params.doctorId ?? "";
    this._profileImageUrl = params.profileImageUrl ?? "";
    this._bannerImageUrl = params.bannerImageUrl ?? "";
    this._dob = params.dob;
    this._gender = params.gender ?? Gender.none;
    this._phone = params.phone;
    this._address = params.address;
    this._about = params.about;
    this._independentFee = params.independentFee;
    this._education = params.education ?? [];
    this._experience = params.experience ?? [];
    this._specialization = params.specialization;
    this._certificates = params.certificates ?? {
      latestDegree: "",
      medicalLicence: "",
    };
    this._practiceType = params.practiceType;
    this._hospitalId = params.hospitalId;
    this._practiceLocations = params.practiceLocations ?? [];
    this._verificationStatus =
      params.verificationStatus ?? VerificationStatus.pending;
    this._verificationSubmissions = params.verificationSubmissions ?? [];
    this._activeSubmissionId = params.activeSubmissionId ?? null;
    this._acceptedTerms = params.acceptedTerms ?? false;
    this._submissionDate = params.submissionDate;
    this._isVisible = params.isVisible ?? false;
    this._createdAt = params.createdAt ?? new Date();
    this._updatedAt = params.updatedAt ?? new Date();
  }

  // Getters
  get id(): string | null {
    return this._id;
  }
  get doctorId(): string {
    return this._doctorId;
  }
  get profileImageUrl(): string {
    return this._profileImageUrl;
  }
  get bannerImageUrl(): string {
    return this._bannerImageUrl;
  }
  get dob(): Date | undefined {
    return this._dob;
  }
  get gender(): Gender {
    return this._gender;
  }
  get phone(): string | undefined {
    return this._phone;
  }
  get address(): string | undefined {
    return this._address;
  }
  get about(): string | undefined {
    return this._about;
  }
  get independentFee(): number | undefined {
    return this._independentFee;
  }
  get education(): DoctorEducation[] {
    return this._education;
  }
  get experience(): DoctorExperience[] {
    return this._experience;
  }
  get specialization(): string | Specialization | undefined {
    return this._specialization;
  }
  get certificates(): DoctorCertificates {
    return this._certificates;
  }
  get practiceType(): PracticeType | undefined {
    return this._practiceType;
  }
  get hospitalId(): string | undefined {
    return this._hospitalId;
  }
  get practiceLocations(): PracticeLocation[] | undefined {
    return this._practiceLocations;
  }
  get verificationStatus(): VerificationStatus | undefined {
    return this._verificationStatus;
  }
  get verificationSubmissions(): VerificationSubmission[] {
    return this._verificationSubmissions;
  }
  get activeSubmissionId(): string | null {
    return this._activeSubmissionId;
  }
  get acceptedTerms(): boolean | undefined {
    return this._acceptedTerms;
  }
  get submissionDate(): Date | undefined {
    return this._submissionDate;
  }
  get isVisible(): boolean {
    return this._isVisible;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  set id(value: string | null) {
    this._id = value;
  }

  set doctorId(value: string) {
    this._doctorId = value;
  }

  set profileImageUrl(value: string) {
    this._profileImageUrl = value;
  }

  set bannerImageUrl(value: string) {
    this._bannerImageUrl = value;
  }

  set dob(value: Date | undefined) {
    this._dob = value;
  }

  set gender(value: Gender) {
    this._gender = value;
  }

  set phone(value: string | undefined) {
    this._phone = value;
  }

  set address(value: string | undefined) {
    this._address = value;
  }

  set about(value: string | undefined) {
    this._about = value;
  }

  set independentFee(value: number | undefined) {
    this._independentFee = value;
  }

  set education(value: DoctorEducation[]) {
    this._education = value;
  }

  set experience(value: DoctorExperience[]) {
    this._experience = value;
  }

  set specialization(value: string | undefined) {
    this._specialization = value;
  }

  set certificates(value: DoctorCertificates) {
    this._certificates = value;
  }

  set practiceType(value: PracticeType | undefined) {
    this._practiceType = value;
  }

  set hospitalId(value: string | undefined) {
    this._hospitalId = value;
  }

  set practiceLocations(value: PracticeLocation[]) {
    this._practiceLocations = value;
  }

  set verificationStatus(value: VerificationStatus | undefined) {
    this._verificationStatus = value;
  }

  set verificationSubmissions(value: VerificationSubmission[]) {
    this._verificationSubmissions = value;
  }

  set activeSubmissionId(value: string | null) {
    this._activeSubmissionId = value;
  }

  set acceptedTerms(value: boolean | undefined) {
    this._acceptedTerms = value;
  }

  set submissionDate(value: Date | undefined) {
    this._submissionDate = value;
  }

  set isVisible(value: boolean) {
    this._isVisible = value;
  }

  set createdAt(value: Date) {
    this._createdAt = value;
  }

  set updatedAt(value: Date) {
    this._updatedAt = value;
  }
}
