import { PracticeLocation } from "../../domain/entities/practiceLocation";
import { IPracticeLocationDocument } from "../../infrastructure/DB/models/practiceLocationModel";

export class PracticeLocationMapper {
  static toEntityFromDocument(
    doc: IPracticeLocationDocument,
  ): PracticeLocation {
    return new PracticeLocation({
      id: doc._id?.toString(),
      name: doc.name,
      type: doc.type,
      doctorId: doc.doctorId.toString(),
      ownerId: doc.ownerId.toString(),
      location: doc.location,
      consultationFee: doc.consultationFee,
      consultationModes: doc.consultationModes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toEntityListFromDocumentList(docList: IPracticeLocationDocument[]) {
    return docList.map((doc) => this.toEntityFromDocument(doc));
  }
}
