export class Review {
  private _id?: string;
  private _appointmentId: string;
  private _patientId: string;
  private _doctorId: string;
  private _answers: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
  };
  private _score: number;
  private _comment?: string;
  private _isAnonymous: boolean;
  private _createdAt?: Date;
  private _updatedAt?: Date;

  constructor(params: {
    id?: string;
    appointmentId: string;
    patientId: string;
    doctorId: string;
    answers: {
      q1: string;
      q2: string;
      q3: string;
      q4: string;
      q5: string;
    };
    score: number;
    comment?: string;
    isAnonymous: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = params.id;
    this._appointmentId = params.appointmentId;
    this._patientId = params.patientId;
    this._doctorId = params.doctorId;
    this._answers = params.answers;
    this._score = params.score;
    this._comment = params.comment;
    this._isAnonymous = params.isAnonymous;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
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

  public get answers(): {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
  } {
    return this._answers;
  }

  public get score(): number {
    return this._score;
  }

  public get comment(): string | undefined {
    return this._comment;
  }

  public get isAnonymous(): boolean {
    return this._isAnonymous;
  }

  public get createdAt(): Date | undefined {
    return this._createdAt;
  }

  public get updatedAt(): Date | undefined {
    return this._updatedAt;
  }
}
