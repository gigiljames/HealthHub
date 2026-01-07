export default class Slot {
  private _id: string | null;
  private _doctorId: string;
  private _title: string;
  private _start: string;
  private _end: string;
  private _mode: "online" | "in-person";
  private _isBooked: boolean;

  constructor(params: {
    id?: string;
    doctorId: string;
    title: string;
    start: string;
    end: string;
    mode: "online" | "in-person";
    isBooked?: boolean;
  }) {
    this._id = params.id ?? null;
    this._doctorId = params.doctorId;
    this._title = params.title;
    this._start = params.start;
    this._end = params.end;
    this._mode = params.mode;
    this._isBooked = params.isBooked ?? false;
  }

  public get id(): string | null {
    return this._id;
  }

  public get doctorId(): string {
    return this._doctorId;
  }

  public set doctorId(value: string) {
    this._doctorId = value;
  }

  public get title(): string {
    return this._title;
  }

  public set title(value: string) {
    this._title = value;
  }

  public get start(): string {
    return this._start;
  }

  public set start(value: string) {
    this._start = value;
  }

  public get end(): string {
    return this._end;
  }

  public set end(value: string) {
    this._end = value;
  }

  public get mode(): "online" | "in-person" {
    return this._mode;
  }

  public set mode(value: "online" | "in-person") {
    this._mode = value;
  }

  public get isBooked(): boolean {
    return this._isBooked;
  }

  public set isBooked(value: boolean) {
    this._isBooked = value;
  }
}
