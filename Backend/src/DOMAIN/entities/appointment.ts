import { AppointmentStatus } from "../enums/appointmentStatus";

export default class Appointment {
  private _id: string | null;
  private _patientId: string;
  private _doctorId: string;
  private _slotId: string;
  private _status: AppointmentStatus;
  private _reason: string;
  private _paymentId: string | null;
  private _payoutId: string | null;

  constructor(params: {
    id?: string;
    patientId: string;
    doctorId: string;
    slotId: string;
    status?: AppointmentStatus;
    reason: string;
    paymentId?: string | null;
    payoutId?: string | null;
  }) {
    this._id = params.id ?? null;
    this._patientId = params.patientId;
    this._doctorId = params.doctorId;
    this._slotId = params.slotId;
    this._status = params.status ?? AppointmentStatus.PENDING_PAYMENT;
    this._reason = params.reason;
    this._paymentId = params.paymentId ?? null;
    this._payoutId = params.payoutId ?? null;
  }

  public get id(): string | null {
    return this._id;
  }

  public get patientId(): string {
    return this._patientId;
  }

  public get doctorId(): string {
    return this._doctorId;
  }

  public get slotId(): string {
    return this._slotId;
  }

  public get status(): AppointmentStatus {
    return this._status;
  }

  public set status(value: AppointmentStatus) {
    this._status = value;
  }

  public get reason(): string {
    return this._reason;
  }

  public get paymentId(): string | null {
    return this._paymentId;
  }

  public set paymentId(value: string | null) {
    this._paymentId = value;
  }

  public get payoutId(): string | null {
    return this._payoutId;
  }

  public set payoutId(value: string | null) {
    this._payoutId = value;
  }
}
