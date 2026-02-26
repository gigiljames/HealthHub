import { PaymentStatus } from "../enums/paymentStatus";

export default class Payment {
  private _id: string | null;
  private _amount: number;
  private _currency: string;
  private _appointmentId: string;
  private _patientId: string;
  private _status: PaymentStatus;
  private _gatewayRef: string | null;

  constructor(params: {
    id?: string;
    amount: number;
    currency: string;
    appointmentId: string;
    patientId: string;
    status?: PaymentStatus;
    gatewayRef?: string | null;
  }) {
    this._id = params.id ?? null;
    this._amount = params.amount;
    this._currency = params.currency;
    this._appointmentId = params.appointmentId;
    this._patientId = params.patientId;
    this._status = params.status ?? PaymentStatus.INITIATED;
    this._gatewayRef = params.gatewayRef ?? null;
  }

  public get id(): string | null {
    return this._id;
  }

  public get amount(): number {
    return this._amount;
  }

  public get currency(): string {
    return this._currency;
  }

  public get appointmentId(): string {
    return this._appointmentId;
  }

  public get patientId(): string {
    return this._patientId;
  }

  public get status(): PaymentStatus {
    return this._status;
  }

  public set status(value: PaymentStatus) {
    this._status = value;
  }

  public get gatewayRef(): string | null {
    return this._gatewayRef;
  }

  public set gatewayRef(value: string | null) {
    this._gatewayRef = value;
  }
}
