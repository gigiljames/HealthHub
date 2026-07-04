export default class DoctorException {
  private _id: string | null;
  private _doctorId: string;
  private _reason: string;
  private _startDatetime: Date;
  private _endDatetime: Date;

  constructor(params: {
    id?: string;
    doctorId: string;
    reason: string;
    startDatetime: Date;
    endDatetime: Date;
  }) {
    this._id = params.id ?? null;
    this._doctorId = params.doctorId;
    this._reason = params.reason;
    this._startDatetime = params.startDatetime;
    this._endDatetime = params.endDatetime;
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

  get reason(): string {
    return this._reason;
  }

  set reason(value: string) {
    this._reason = value;
  }

  get startDatetime(): Date {
    return this._startDatetime;
  }

  set startDatetime(value: Date) {
    this._startDatetime = value;
  }

  get endDatetime(): Date {
    return this._endDatetime;
  }

  set endDatetime(value: Date) {
    this._endDatetime = value;
  }
}
