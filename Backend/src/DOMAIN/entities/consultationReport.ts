export class ConsultationReport {
  private _id?: string;
  private _appointmentId: string;
  private _patientId: string;
  private _doctorId: string;
  private _chiefComplaint: string;
  private _clinicalNotes: string;
  private _diagnosis: string;
  private _followUpDate: Date | null;
  private _followUpNotes: string;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(params: {
    id?: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    chiefComplaint: string;
    clinicalNotes?: string;
    diagnosis: string;
    followUpDate?: Date | null;
    followUpNotes?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id;
    this._appointmentId = params.appointmentId;
    this._patientId = params.patientId;
    this._doctorId = params.doctorId;
    this._chiefComplaint = params.chiefComplaint;
    this._clinicalNotes = params.clinicalNotes ?? "";
    this._diagnosis = params.diagnosis;
    this._followUpDate = params.followUpDate ?? null;
    this._followUpNotes = params.followUpNotes ?? "";
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public get id(): string | undefined {
    return this._id;
  }

  public get appointmentId(): string {
    return this._appointmentId;
  }

  public get patientId(): string {
    return this._patientId;
  }

  public get doctorId(): string {
    return this._doctorId;
  }

  public get chiefComplaint(): string {
    return this._chiefComplaint;
  }

  public get clinicalNotes(): string {
    return this._clinicalNotes;
  }

  public get diagnosis(): string {
    return this._diagnosis;
  }

  public get followUpDate(): Date | null {
    return this._followUpDate;
  }

  public get followUpNotes(): string {
    return this._followUpNotes;
  }

  public get createdAt(): Date | undefined {
    return this._createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }
}
