export default class Dispute {
  private _id: string | null;
  private _appointmentId: string;
  private _reporterId: string;
  private _reportedUserId: string;
  private _reason: string;
  private _description: string;
  private _evidence: Array<{ key: string; name: string; type: string }>;
  private _status: "OPEN" | "UNDER_REVIEW" | "RESOLVED";
  private _resolutionMessage: string | null;
  private _resolvedBy: string | null;
  private _resolvedAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id?: string;
    appointmentId: string;
    reporterId: string;
    reportedUserId: string;
    reason: string;
    description: string;
    evidence?: Array<{ key: string; name: string; type: string }>;
    status?: "OPEN" | "UNDER_REVIEW" | "RESOLVED";
    resolutionMessage?: string | null;
    resolvedBy?: string | null;
    resolvedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id ?? null;
    this._appointmentId = params.appointmentId;
    this._reporterId = params.reporterId;
    this._reportedUserId = params.reportedUserId;
    this._reason = params.reason;
    this._description = params.description;
    this._evidence = params.evidence ?? [];
    this._status = params.status ?? "OPEN";
    this._resolutionMessage = params.resolutionMessage ?? null;
    this._resolvedBy = params.resolvedBy ?? null;
    this._resolvedAt = params.resolvedAt ?? null;
    this._createdAt = params.createdAt ?? new Date();
    this._updatedAt = params.updatedAt ?? new Date();
  }

  public get id(): string | null {
    return this._id;
  }
  public get appointmentId(): string {
    return this._appointmentId;
  }
  public get reporterId(): string {
    return this._reporterId;
  }
  public get reportedUserId(): string {
    return this._reportedUserId;
  }
  public get reason(): string {
    return this._reason;
  }
  public get description(): string {
    return this._description;
  }
  public get evidence(): Array<{ key: string; name: string; type: string }> {
    return this._evidence;
  }
  public get status(): "OPEN" | "UNDER_REVIEW" | "RESOLVED" {
    return this._status;
  }
  public set status(value: "OPEN" | "UNDER_REVIEW" | "RESOLVED") {
    this._status = value;
    this._updatedAt = new Date();
  }
  public get resolutionMessage(): string | null {
    return this._resolutionMessage;
  }
  public set resolutionMessage(value: string | null) {
    this._resolutionMessage = value;
    this._updatedAt = new Date();
  }
  public get resolvedBy(): string | null {
    return this._resolvedBy;
  }
  public set resolvedBy(value: string | null) {
    this._resolvedBy = value;
    this._updatedAt = new Date();
  }
  public get resolvedAt(): Date | null {
    return this._resolvedAt;
  }
  public set resolvedAt(value: Date | null) {
    this._resolvedAt = value;
    this._updatedAt = new Date();
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
