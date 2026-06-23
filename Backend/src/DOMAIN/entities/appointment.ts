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
  private _cancellationReason: string | null;
  private _refundTransactionId: string | null;
  private _platformFee: number;
  private _consultationFee: number;

  constructor(params: {
    id?: string;
    patientId: string;
    doctorId: string;
    slotId: string;
    status?: AppointmentStatus;
    reason: string;
    paymentId?: string | null;
    payoutId?: string | null;
    cancellationReason?: string | null;
    refundTransactionId?: string | null;
    platformFee?: number;
    consultationFee?: number;
  }) {
    this._id = params.id ?? null;
    this._patientId = params.patientId;
    this._doctorId = params.doctorId;
    this._slotId = params.slotId;
    this._status = params.status ?? AppointmentStatus.PENDING_PAYMENT;
    this._reason = params.reason;
    this._paymentId = params.paymentId ?? null;
    this._payoutId = params.payoutId ?? null;
    this._cancellationReason = params.cancellationReason ?? null;
    this._refundTransactionId = params.refundTransactionId ?? null;
    this._platformFee = params.platformFee ?? 0;
    this._consultationFee = params.consultationFee ?? 0;
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

  public get cancellationReason(): string | null {
    return this._cancellationReason;
  }

  public set cancellationReason(value: string | null) {
    this._cancellationReason = value;
  }

  public get refundTransactionId(): string | null {
    return this._refundTransactionId;
  }

  public set refundTransactionId(value: string | null) {
    this._refundTransactionId = value;
  }

  public get platformFee(): number {
    return this._platformFee;
  }

  public set platformFee(value: number) {
    this._platformFee = value;
  }

  public get consultationFee(): number {
    return this._consultationFee;
  }

  public set consultationFee(value: number) {
    this._consultationFee = value;
  }
}
