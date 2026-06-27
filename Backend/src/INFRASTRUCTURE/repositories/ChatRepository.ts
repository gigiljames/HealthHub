import { Types } from "mongoose";
import { BaseRepository } from "./base/BaseRepository";
import { IChatRepository } from "../../domain/interfaces/repositories/IChatRepository";
import { IConsultationDocument, consultationModel } from "../DB/models/consultationModel";
import { ChatListDTO } from "../../application/DTOs/consultation/chatListDTO";
import { ChatListMapper } from "./mappers/ChatListMapper";

export class ChatRepository
  extends BaseRepository<IConsultationDocument>
  implements IChatRepository
{
  constructor() {
    super(consultationModel);
  }

  async findChatsForUser(userId: string, role: "user" | "doctor"): Promise<ChatListDTO[]> {
    const matchStage: Record<string, any> = {};
    let recipientField = "";
    let recipientProfileFrom = "";
    let localProfileField = "";
    let foreignProfileField = "";

    if (role === "user") {
      matchStage.patientId = new Types.ObjectId(userId);
      recipientField = "doctorId";
      recipientProfileFrom = "doctorprofiles";
      localProfileField = "doctorId";
      foreignProfileField = "doctorId";
    } else {
      matchStage.doctorId = new Types.ObjectId(userId);
      recipientField = "patientId";
      recipientProfileFrom = "userprofiles";
      localProfileField = "patientId";
      foreignProfileField = "userId";
    }

    const pipeline: any[] = [
      { $match: matchStage },
      // Join Appointment to resolve slotId
      {
        $lookup: {
          from: "appointments",
          localField: "appointmentId",
          foreignField: "_id",
          as: "appointment",
        },
      },
      { $unwind: "$appointment" },
      // Join Slot to verify that mode is online
      {
        $lookup: {
          from: "slots",
          localField: "appointment.slotId",
          foreignField: "_id",
          as: "slot",
        },
      },
      { $unwind: "$slot" },
      // Only keep online slots (exclude in-person)
      { $match: { "slot.mode": "online" } },
      // Join recipient details (Auth table)
      {
        $lookup: {
          from: "auths",
          localField: recipientField,
          foreignField: "_id",
          as: "recipientAuth",
        },
      },
      { $unwind: "$recipientAuth" },
      // Join recipient Profile (doctorprofiles or userprofiles)
      {
        $lookup: {
          from: recipientProfileFrom,
          localField: localProfileField,
          foreignField: foreignProfileField,
          as: "recipientProfile",
        },
      },
      {
        $unwind: {
          path: "$recipientProfile",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // If role is user, join specializations to get doctor's specialization name
    if (role === "user") {
      pipeline.push(
        {
          $lookup: {
            from: "specializations",
            localField: "recipientProfile.specialization",
            foreignField: "_id",
            as: "specialization",
          },
        },
        {
          $unwind: {
            path: "$specialization",
            preserveNullAndEmptyArrays: true,
          },
        }
      );
    }

    // Lookup latest message in messages collection
    pipeline.push(
      {
        $lookup: {
          from: "messages",
          let: { consultId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$consultationId", "$$consultId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: "latestMessage",
        },
      },
      {
        $unwind: {
          path: "$latestMessage",
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // Lookup unread messages count
    const oppositeSenderRole = role === "user" ? "doctor" : "patient";
    pipeline.push(
      {
        $lookup: {
          from: "messages",
          let: { consultId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$consultationId", "$$consultId"] },
                    { $eq: ["$readAt", null] },
                    { $eq: ["$senderRole", oppositeSenderRole] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "unreadMessagesCount",
        },
      },
      {
        $unwind: {
          path: "$unreadMessagesCount",
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // Lookup post-consultation patient messages count to close chats that exhausted limits
    pipeline.push(
      {
        $lookup: {
          from: "messages",
          let: { consultId: "$_id", end: "$endedAt" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$consultationId", "$$consultId"] },
                    { $eq: ["$senderRole", "patient"] },
                    { $gt: ["$$end", null] },
                    { $gt: ["$createdAt", "$$end"] },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "postConsultMessagesCount",
        },
      },
      {
        $unwind: {
          path: "$postConsultMessagesCount",
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // Project results into simplified objects
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const projection: Record<string, any> = {
      consultationId: "$_id",
      roomId: "$roomId",
      recipientId: "$recipientAuth._id",
      recipientName: "$recipientAuth.name",
      recipientEmail: "$recipientAuth.email",
      recipientImageUrl: "$recipientProfile.profileImageUrl",
      endedAt: "$endedAt",
      slotStart: "$slot.start",
      isClosed: {
        $cond: {
          if: { $gt: ["$endedAt", null] },
          then: {
            $or: [
              {
                $lt: [
                  "$endedAt",
                  sevenDaysAgo,
                ],
              },
              {
                $gte: [
                  { $ifNull: ["$postConsultMessagesCount.count", 0] },
                  30,
                ],
              },
            ],
          },
          else: false,
        },
      },
      unreadCount: { $ifNull: ["$unreadMessagesCount.count", 0] },
      createdAt: "$createdAt",
      latestMessage: {
        text: "$latestMessage.text",
        file: "$latestMessage.file",
        senderRole: "$latestMessage.senderRole",
        createdAt: "$latestMessage.createdAt",
      },
    };

    if (role === "user") {
      projection.recipientSpecialization = "$specialization.name";
    }

    pipeline.push({ $project: projection });

    // Sort by latest message date descending (with fallback to consultation creation date)
    pipeline.push({
      $sort: {
        "latestMessage.createdAt": -1,
        createdAt: -1,
      },
    });

    const results = await this.model.aggregate(pipeline);
    return ChatListMapper.toDTOList(results);
  }
}
