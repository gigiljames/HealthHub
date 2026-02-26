import { SlotStatus } from "../enums/slotStatus";

export default class Slot {
  private _id: string | null;
  private _doctorId: string;
  private _title: string;
  private _start: Date;
  private _end: Date;
  private _mode: "online" | "in-person";
  private _practiceLocationId: string;
  private _status: SlotStatus;
  private _lockedUntil: Date | null;
  private _lockedBy: string | null;
  private _appointmentId: string | null;

  constructor(params: {
    id?: string;
    doctorId: string;
    title: string;
    start: Date;
    end: Date;
    mode: "online" | "in-person";
    practiceLocationId: string;
    status?: SlotStatus;
    lockedUntil?: Date | null;
    lockedBy?: string | null;
    appointmentId?: string | null;
  }) {
    this._id = params.id ?? null;
    this._doctorId = params.doctorId;
    this._title = params.title;
    this._start = params.start;
    this._end = params.end;
    this._mode = params.mode;
    this._practiceLocationId = params.practiceLocationId;
    this._status = params.status ?? SlotStatus.AVAILABLE;
    this._lockedUntil = params.lockedUntil ?? null;
    this._lockedBy = params.lockedBy ?? null;
    this._appointmentId = params.appointmentId ?? null;
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

  public get status(): SlotStatus {
    return this._status;
  }

  public set status(value: SlotStatus) {
    this._status = value;
  }

  public get lockedUntil(): Date | null {
    return this._lockedUntil;
  }

  public set lockedUntil(value: Date | null) {
    this._lockedUntil = value;
  }

  public get lockedBy(): string | null {
    return this._lockedBy;
  }

  public set lockedBy(value: string | null) {
    this._lockedBy = value;
  }

  public get appointmentId(): string | null {
    return this._appointmentId;
  }

  public set appointmentId(value: string | null) {
    this._appointmentId = value;
  }
}
