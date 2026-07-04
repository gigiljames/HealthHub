export default class ScheduleRule {
  private _id: string | null;
  private _doctorId: string;
  private _title: string;
  private _practiceLocationId: string;
  private _mode: "online" | "in-person";
  private _duration: number;
  private _buffer: number;
  private _rruleString: string;
  private _validFrom: Date;
  private _validTo: Date | null;
  private _startHour: string;
  private _endHour: string;
  private _isActive: boolean;

  constructor(params: {
    id?: string;
    doctorId: string;
    title: string;
    practiceLocationId: string;
    mode: "online" | "in-person";
    duration: number;
    buffer: number;
    rruleString: string;
    validFrom: Date;
    validTo: Date | null;
    startHour: string;
    endHour: string;
    isActive?: boolean;
  }) {
    this._id = params.id ?? null;
    this._doctorId = params.doctorId;
    this._title = params.title;
    this._practiceLocationId = params.practiceLocationId;
    this._mode = params.mode;
    this._duration = params.duration;
    this._buffer = params.buffer;
    this._rruleString = params.rruleString;
    this._validFrom = params.validFrom;
    this._validTo = params.validTo;
    this._startHour = params.startHour;
    this._endHour = params.endHour;
    this._isActive = params.isActive ?? true;
  }

  get id(): string | null {
    return this._id;
  }

  get doctorId(): string {
    return this._doctorId;
  }

  set doctorId(value: string) {
    this._doctorId = value;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get practiceLocationId(): string {
    return this._practiceLocationId;
  }

  set practiceLocationId(value: string) {
    this._practiceLocationId = value;
  }

  get mode(): "online" | "in-person" {
    return this._mode;
  }

  set mode(value: "online" | "in-person") {
    this._mode = value;
  }

  get duration(): number {
    return this._duration;
  }

  set duration(value: number) {
    this._duration = value;
  }

  get buffer(): number {
    return this._buffer;
  }

  set buffer(value: number) {
    this._buffer = value;
  }

  get rruleString(): string {
    return this._rruleString;
  }

  set rruleString(value: string) {
    this._rruleString = value;
  }

  get validFrom(): Date {
    return this._validFrom;
  }

  set validFrom(value: Date) {
    this._validFrom = value;
  }

  get validTo(): Date | null {
    return this._validTo;
  }

  set validTo(value: Date | null) {
    this._validTo = value;
  }

  get startHour(): string {
    return this._startHour;
  }

  set startHour(value: string) {
    this._startHour = value;
  }

  get endHour(): string {
    return this._endHour;
  }

  set endHour(value: string) {
    this._endHour = value;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
  }
}
