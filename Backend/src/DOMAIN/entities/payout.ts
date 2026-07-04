import { PayoutStatus } from "../enums/payoutStatus";

export default class Payout {
  private _id: string | null;
  private _doctorId: string;
  private _amount: number;
  private _currency: string;
  private _status: PayoutStatus;
  private _transactionId: string | null;
  private _grossAmount: number;
  private _platformCommissions: number;
  private _appointmentIds: string[];

  constructor(params: {
    id?: string;
    doctorId: string;
    amount: number;
    currency: string;
    status?: PayoutStatus;
    transactionId?: string | null;
    grossAmount: number;
    platformCommissions: number;
    appointmentIds: string[];
  }) {
    this._id = params.id ?? null;
    this._doctorId = params.doctorId;
    this._amount = params.amount;
    this._currency = params.currency;
    this._status = params.status ?? PayoutStatus.PENDING;
    this._transactionId = params.transactionId ?? null;
    this._grossAmount = params.grossAmount;
    this._platformCommissions = params.platformCommissions;
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

  public get transactionId(): string | null {
    return this._transactionId;
  }

  public set transactionId(value: string | null) {
    this._transactionId = value;
  }

  public get grossAmount(): number {
    return this._grossAmount;
  }

  public get platformCommissions(): number {
    return this._platformCommissions;
  }

  public get appointmentIds(): string[] {
    return this._appointmentIds;
  }
}
