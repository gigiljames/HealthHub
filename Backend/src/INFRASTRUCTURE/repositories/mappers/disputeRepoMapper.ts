import { IDisputeDocument } from "../../DB/models/disputeModel";
import Dispute from "../../../domain/entities/dispute";

export class DisputeRepoMapper {
  static toEntityFromDocument(doc: IDisputeDocument): Dispute {
    return new Dispute({
      id: doc._id?.toString(),
      appointmentId: doc.appointmentId?.toString(),
      reporterId: doc.reporterId?.toString(),
      reportedUserId: doc.reportedUserId?.toString(),
      reason: doc.reason,
      description: doc.description,
      evidence: doc.evidence.map((ev) => ({
        key: ev.key,
        name: ev.name,
        type: ev.type,
      })),
      status: doc.status,
      resolutionMessage: doc.resolutionMessage,
      resolvedBy: doc.resolvedBy?.toString() || null,
      resolvedAt: doc.resolvedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
