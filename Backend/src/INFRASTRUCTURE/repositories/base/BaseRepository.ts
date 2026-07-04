import { Document, Model, Types } from "mongoose";

export abstract class BaseRepository<TDocument extends Document> {
  constructor(protected readonly model: Model<TDocument>) {}

  protected async findDocumentById(id: string): Promise<TDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findById(id);
  }

  async deleteById(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }
}
