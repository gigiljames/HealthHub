import { ConsultationModes } from "../enums/consultationModes";

export class PracticeLocation {
  private _id?: string;
  private _doctorId: string;
  private _ownerId: string;
  private _name: string;
  private _type: string;
  private _location: {
    type: "Point";
    coordinates: number[];
    address: string;
    placeId: string;
  } | null;
  private _consultationFee: number;
  private _consultationModes: ConsultationModes[];
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(param: {
    id?: string;
    doctorId: string;
    ownerId: string;
    name: string;
    type: string;
    location: {
      type: "Point";
      coordinates: number[];
      address: string;
      placeId: string;
    } | null;
    consultationFee: number;
    consultationModes: ConsultationModes[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = param.id;
    this._doctorId = param.doctorId;
    this._ownerId = param.ownerId;
    this._name = param.name;
    this._type = param.type;
    this._location = param.location ?? null;
    this._consultationFee = param.consultationFee;
    this._consultationModes = param.consultationModes;
    this._createdAt = param.createdAt || new Date();
    this._updatedAt = param.updatedAt || new Date();
  }

  get id(): string | undefined {
    return this._id;
  }

  get doctorId(): string {
    return this._doctorId;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get name(): string {
    return this._name;
  }

  get type(): string {
    return this._type;
  }

  get location(): {
    type: "Point";
    coordinates: number[];
    address: string;
    placeId: string;
  } | null {
    return this._location;
  }

  get consultationFee(): number {
    return this._consultationFee;
  }

  get consultationModes(): ConsultationModes[] {
    return this._consultationModes;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  set id(value: string | undefined) {
    this._id = value;
  }

  set doctorId(value: string) {
    this._doctorId = value;
  }

  set ownerId(value: string) {
    this._ownerId = value;
  }

  set name(value: string) {
    this._name = value;
  }

  set type(value: string) {
    this._type = value;
  }

  set location(
    value: {
      type: "Point";
      coordinates: number[];
      address: string;
      placeId: string;
    } | null,
  ) {
    this._location = value;
  }

  set consultationFee(value: number) {
    this._consultationFee = value;
  }

  set consultationModes(value: ConsultationModes[]) {
    this._consultationModes = value;
  }

  set createdAt(value: Date) {
    this._createdAt = value;
  }

  set updatedAt(value: Date) {
    this._updatedAt = value;
  }
}
