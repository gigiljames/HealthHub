export interface PrescriptionMedicine {
  medicine: string;
  dosage: string;
  frequency: string;
  timing: "Before Food" | "After Food";
  duration: string;
}

export class Prescription {
  private _id?: string;
  private _appointmentId: string;
  private _patientId: string;
  private _doctorId: string;
  private _medicines: PrescriptionMedicine[];
  private _verificationToken?: string;
  private _prescriptionNumber?: string;
  private _status?: string;
  private _signatureKey?: string;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(params: {
    id?: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    medicines: PrescriptionMedicine[];
    verificationToken?: string;
    prescriptionNumber?: string;
    status?: string;
    signatureKey?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id;
    this._appointmentId = params.appointmentId;
    this._patientId = params.patientId;
    this._doctorId = params.doctorId;
    this._medicines = params.medicines;
    this._verificationToken = params.verificationToken;
    this._prescriptionNumber = params.prescriptionNumber;
    this._status = params.status;
    this._signatureKey = params.signatureKey;
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

  public get medicines(): PrescriptionMedicine[] {
    return this._medicines;
  }

  public get verificationToken(): string | undefined {
    return this._verificationToken;
  }

  public get prescriptionNumber(): string | undefined {
    return this._prescriptionNumber;
  }

  public get status(): string | undefined {
    return this._status;
  }

  public get signatureKey(): string | undefined {
    return this._signatureKey;
  }

  public get createdAt(): Date | undefined {
    return this._createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }
}

