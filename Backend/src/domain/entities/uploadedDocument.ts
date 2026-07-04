export class UploadedDocument {
  private _id?: string;
  private _patientId: string;
  private _title: string;
  private _category: string;
  private _customCategory?: string;
  private _specializationId?: string;
  private _customSpecialization?: string;
  private _fileKey: string;
  private _thumbnailKey: string;
  private _reportDate: Date;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(params: {
    id?: string;
    patientId: string;
    title: string;
    category: string;
    customCategory?: string;
    specializationId?: string;
    customSpecialization?: string;
    fileKey: string;
    thumbnailKey: string;
    reportDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id;
    this._patientId = params.patientId;
    this._title = params.title;
    this._category = params.category;
    this._customCategory = params.customCategory;
    this._specializationId = params.specializationId;
    this._customSpecialization = params.customSpecialization;
    this._fileKey = params.fileKey;
    this._thumbnailKey = params.thumbnailKey;
    this._reportDate = params.reportDate;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public get id(): string | undefined {
    return this._id;
  }

  public get patientId(): string {
    return this._patientId;
  }

  public get title(): string {
    return this._title;
  }

  public get category(): string {
    return this._category;
  }

  public get customCategory(): string | undefined {
    return this._customCategory;
  }

  public get specializationId(): string | undefined {
    return this._specializationId;
  }

  public get customSpecialization(): string | undefined {
    return this._customSpecialization;
  }

  public get fileKey(): string {
    return this._fileKey;
  }

  public get thumbnailKey(): string {
    return this._thumbnailKey;
  }

  public get reportDate(): Date {
    return this._reportDate;
  }

  public get createdAt(): Date | undefined {
    return this._createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }
}
