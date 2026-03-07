import { TransactionDirection } from "../enums/transactionDirection";
import { TransactionType } from "../enums/transactionType";
import { TransactionSource } from "../enums/transactionSource";
import { PaymentStatus } from "../enums/paymentStatus";

export default class Transaction {
  private _id: string | null;
  private _direction: TransactionDirection;
  private _type: TransactionType;
  private _source: TransactionSource;
  private _amount: number;
  private _currency: string;
  private _walletId: string | null;
  private _gatewayRef: string | null;
  private _status: PaymentStatus;
  private _balanceAfter: number | null;
  private _appointmentId: string | null;
  private _payoutId: string | null;

  constructor(params: {
    id?: string;
    direction: TransactionDirection;
    type: TransactionType;
    source: TransactionSource;
    amount: number;
    currency: string;
    walletId?: string | null;
    gatewayRef?: string | null;
    status?: PaymentStatus;
    balanceAfter?: number | null;
    appointmentId?: string | null;
    payoutId?: string | null;
  }) {
    this._id = params.id ?? null;
    this._direction = params.direction;
    this._type = params.type;
    this._source = params.source;
    this._amount = params.amount;
    this._currency = params.currency;
    this._walletId = params.walletId ?? null;
    this._gatewayRef = params.gatewayRef ?? null;
    this._status = params.status ?? PaymentStatus.INITIATED;
    this._balanceAfter = params.balanceAfter ?? null;
    this._appointmentId = params.appointmentId ?? null;
    this._payoutId = params.payoutId ?? null;
  }

  public get id(): string | null {
    return this._id;
  }
  public get direction(): TransactionDirection {
    return this._direction;
  }
  public get type(): TransactionType {
    return this._type;
  }
  public get source(): TransactionSource {
    return this._source;
  }
  public get amount(): number {
    return this._amount;
  }
  public get currency(): string {
    return this._currency;
  }
  public get walletId(): string | null {
    return this._walletId;
  }
  public get gatewayRef(): string | null {
    return this._gatewayRef;
  }
  public get status(): PaymentStatus {
    return this._status;
  }
  public set status(value: PaymentStatus) {
    this._status = value;
  }
  public get balanceAfter(): number | null {
    return this._balanceAfter;
  }
  public set balanceAfter(value: number | null) {
    this._balanceAfter = value;
  }
  public get appointmentId(): string | null {
    return this._appointmentId;
  }
  public get payoutId(): string | null {
    return this._payoutId;
  }
}
