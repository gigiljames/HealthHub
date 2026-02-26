import { PayoutStatus } from "../enums/payoutStatus";

export default class Payout {
  private _id: string | null;
  private _doctorId: string;
  private _amount: number;
  private _currency: string;
  private _status: PayoutStatus;
  private _gatewayRef: string | null;
  private _appointmentIds: string[];

  constructor(params: {
    id?: string;
    doctorId: string;
    amount: number;
    currency: string;
    status?: PayoutStatus;
    gatewayRef?: string | null;
    appointmentIds: string[];
  }) {
    this._id = params.id ?? null;
    this._doctorId = params.doctorId;
    this._amount = params.amount;
    this._currency = params.currency;
    this._status = params.status ?? PayoutStatus.PENDING;
    this._gatewayRef = params.gatewayRef ?? null;
    this._appointmentIds = params.appointmentIds;
  }

  public get id(): string | null {
    return this._id;
  }

  public get doctorId(): string {
    return this._doctorId;
  }

  public get amount(): number {
    return this._amount;
  }

  public get currency(): string {
    return this._currency;
  }

  public get status(): PayoutStatus {
    return this._status;
  }

  public set status(value: PayoutStatus) {
    this._status = value;
  }

  public get gatewayRef(): string | null {
    return this._gatewayRef;
  }

  public set gatewayRef(value: string | null) {
    this._gatewayRef = value;
  }

  public get appointmentIds(): string[] {
    return this._appointmentIds;
  }
}
