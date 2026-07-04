import { RescheduleStatus } from "../enums/rescheduleStatus";

export default class RescheduleRequest {
  private _id: string | null;
  private _appointmentId: string;
  private _oldSlotId: string;
  private _newSlotId: string;
  private _doctorId: string;
  private _patientId: string;
  private _status: RescheduleStatus;
  private _reason: string;
  private _customReason: string | null;
  private _createdAt: Date | null;
  private _updatedAt: Date | null;

  constructor(params: {
    id?: string;
    appointmentId: string;
    oldSlotId: string;
    newSlotId: string;
    doctorId: string;
    patientId: string;
    status?: RescheduleStatus;
    reason: string;
    customReason?: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
  }) {
    this._id = params.id ?? null;
    this._appointmentId = params.appointmentId;
    this._oldSlotId = params.oldSlotId;
    this._newSlotId = params.newSlotId;
    this._doctorId = params.doctorId;
    this._patientId = params.patientId;
    this._status = params.status ?? RescheduleStatus.PENDING;
    this._reason = params.reason;
    this._customReason = params.customReason ?? null;
    this._createdAt = params.createdAt ?? null;
    this._updatedAt = params.updatedAt ?? null;
  }

  public get id(): string | null {
    return this._id;
  }

  public get appointmentId(): string {
    return this._appointmentId;
  }

  public get oldSlotId(): string {
    return this._oldSlotId;
  }

  public get newSlotId(): string {
    return this._newSlotId;
  }

  public get doctorId(): string {
    return this._doctorId;
  }

  public get patientId(): string {
    return this._patientId;
  }

  public get status(): RescheduleStatus {
    return this._status;
  }

  public set status(value: RescheduleStatus) {
    this._status = value;
  }

  public get reason(): string {
    return this._reason;
  }

  public get customReason(): string | null {
    return this._customReason;
  }

  public get createdAt(): Date | null {
    return this._createdAt;
  }

  public get updatedAt(): Date | null {
    return this._updatedAt;
  }
}
