export default class Wallet {
  private _id: string | null;
  private _userId: string;
  private _currency: string;
  private _balance: number;

  constructor(params: {
    id?: string;
    userId: string;
    currency?: string;
    balance?: number;
  }) {
    this._id = params.id ?? null;
    this._userId = params.userId;
    this._currency = params.currency ?? "INR";
    this._balance = params.balance ?? 0;
  }

  public get id(): string | null {
    return this._id;
  }
  public get userId(): string {
    return this._userId;
  }
  public get currency(): string {
    return this._currency;
  }
  public get balance(): number {
    return this._balance;
  }
  public set balance(value: number) {
    this._balance = value;
  }
}
