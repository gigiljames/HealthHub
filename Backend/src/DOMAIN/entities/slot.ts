export default class Slot {
  private _id: string | null;
  private _doctorId: string;
  private _title: string;
  private _start: Date;
  private _end: Date;
  private _mode: "online" | "in-person";
  private _practiceLocationId: string;
  private _isBooked: boolean;

  constructor(params: {
    id?: string;
    doctorId: string;
    title: string;
    start: Date;
    end: Date;
    mode: "online" | "in-person";
    practiceLocationId: string;
    isBooked?: boolean;
  }) {
    this._id = params.id ?? null;
    this._doctorId = params.doctorId;
    this._title = params.title;
    this._start = params.start;
    this._end = params.end;
    this._mode = params.mode;
    this._practiceLocationId = params.practiceLocationId;
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

  public get start(): Date {
    return this._start;
  }

  public set start(value: Date) {
    this._start = value;
  }

  public get end(): Date {
    return this._end;
  }

  public set end(value: Date) {
    this._end = value;
  }

  public get mode(): "online" | "in-person" {
    return this._mode;
  }

  public set mode(value: "online" | "in-person") {
    this._mode = value;
  }

  public get practiceLocationId(): string {
    return this._practiceLocationId;
  }

  public set practiceLocationId(value: string) {
    this._practiceLocationId = value;
  }

  public get isBooked(): boolean {
    return this._isBooked;
  }

  public set isBooked(value: boolean) {
    this._isBooked = value;
  }
}
