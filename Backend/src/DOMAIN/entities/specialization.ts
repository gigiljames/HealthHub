import { MESSAGES } from "../constants/messages";

export default class Specialization {
  private _id: string;
  private _name: string;
  private _description: string;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;
  private static readonly _nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
  private static readonly _descriptionRegex = /^[A-Za-z0-9.,'’"()\- ]{10,200}$/;

  constructor(params: {
    id?: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = params.id;
    this._name = params.name;
    this._description = params.description ?? "";
    this._isActive = params.isActive;
    this._createdAt = params.createdAt ?? new Date();
    this._updatedAt = params.updatedAt ?? new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  updateName(name: string) {
    if (Specialization._nameRegex.test(name)) {
      this._name = name;
      this._updatedAt = new Date();
    } else {
      throw new Error(MESSAGES.INVALID_SPEC_NAME);
    }
  }

  updateDescription(desc: string) {
    if (Specialization._descriptionRegex.test(desc)) {
      this._description = desc;
      this._updatedAt = new Date();
    } else {
      throw new Error(MESSAGES.INVALID_SPEC_DESC);
    }
  }
  activate() {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate() {
    this._isActive = false;
    this._updatedAt = new Date();
  }
}
