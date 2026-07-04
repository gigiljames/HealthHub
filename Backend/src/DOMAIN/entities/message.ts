export class Message {
  private readonly _id?: string;
  private readonly _consultationId: string;
  private readonly _roomId: string;
  private readonly _senderId: string;
  private readonly _senderRole: "doctor" | "patient";
  private readonly _text?: string;
  private readonly _replyTo: string | null;
  private readonly _replyToText: string | null;
  private readonly _replyToRole: "doctor" | "patient" | null;
  private readonly _isEdited: boolean;
  private readonly _isDeleted: boolean;
  private readonly _readAt: Date | null;
  private readonly _file?: {
    key: string;
    name: string;
    type: "image" | "video" | "document";
    size: number;
  };
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(params: {
    id?: string;
    consultationId: string;
    roomId: string;
    senderId: string;
    senderRole: "doctor" | "patient";
    text?: string;
    replyTo?: string | null;
    replyToText?: string | null;
    replyToRole?: "doctor" | "patient" | null;
    isEdited?: boolean;
    isDeleted?: boolean;
    readAt?: Date | null;
    file?: {
      key: string;
      name: string;
      type: "image" | "video" | "document";
      size: number;
    };
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id;
    this._consultationId = params.consultationId;
    this._roomId = params.roomId;
    this._senderId = params.senderId;
    this._senderRole = params.senderRole;
    this._text = params.text;
    this._replyTo = params.replyTo ?? null;
    this._replyToText = params.replyToText ?? null;
    this._replyToRole = params.replyToRole ?? null;
    this._isEdited = params.isEdited ?? false;
    this._isDeleted = params.isDeleted ?? false;
    this._readAt = params.readAt ?? null;
    this._file = params.file;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  public get id(): string | undefined {
    return this._id;
  }

  public get consultationId(): string {
    return this._consultationId;
  }

  public get roomId(): string {
    return this._roomId;
  }

  public get senderId(): string {
    return this._senderId;
  }

  public get senderRole(): "doctor" | "patient" {
    return this._senderRole;
  }

  public get text(): string | undefined {
    return this._text;
  }

  public get replyTo(): string | null {
    return this._replyTo;
  }

  public get replyToText(): string | null {
    return this._replyToText;
  }

  public get replyToRole(): "doctor" | "patient" | null {
    return this._replyToRole;
  }

  public get isEdited(): boolean {
    return this._isEdited;
  }

  public get isDeleted(): boolean {
    return this._isDeleted;
  }

  public get readAt(): Date | null {
    return this._readAt;
  }

  public get file() {
    return this._file;
  }

  public get createdAt(): Date | undefined {
    return this._createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }
}
