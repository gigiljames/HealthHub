export class Consultation {
  private _id?: string;
  private _appointmentId: string;
  private _patientId: string;
  private _doctorId: string;
  private _patientJoinedAt: Date | null;
  private _doctorJoinedAt: Date | null;
  private _startedAt: Date | null;
  private _endedAt: Date | null;
  private _roomId: string;

  constructor(params: {
    id?: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    patientJoinedAt?: Date | null;
    doctorJoinedAt?: Date | null;
    startedAt?: Date | null;
    endedAt?: Date | null;
    roomId: string;
  }) {
    this._id = params.id;
    this._appointmentId = params.appointmentId;
    this._patientId = params.patientId;
    this._doctorId = params.doctorId;
    this._patientJoinedAt = params.patientJoinedAt ?? null;
    this._doctorJoinedAt = params.doctorJoinedAt ?? null;
    this._startedAt = params.startedAt ?? null;
    this._endedAt = params.endedAt ?? null;
    this._roomId = params.roomId;
  }

  public get id(): string | undefined {
    return this._id;
  }
  public get appointmentId(): string {
    return this._appointmentId;
  }
  public get patientId(): string {
    return this._patientId;
  }
  public get doctorId(): string {
    return this._doctorId;
  }
  public get patientJoinedAt(): Date | null {
    return this._patientJoinedAt;
  }
  public get doctorJoinedAt(): Date | null {
    return this._doctorJoinedAt;
  }
  public get startedAt(): Date | null {
    return this._startedAt;
  }
  public get endedAt(): Date | null {
    return this._endedAt;
  }
  public get roomId(): string {
    return this._roomId;
  }

  public toJSON() {
    return {
      id: this._id,
      appointmentId: this._appointmentId,
      patientId: this._patientId,
      doctorId: this._doctorId,
      patientJoinedAt: this._patientJoinedAt,
      doctorJoinedAt: this._doctorJoinedAt,
      startedAt: this._startedAt,
      endedAt: this._endedAt,
      roomId: this._roomId,
    };
  }
}
