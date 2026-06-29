import { PipelineStage, Types, FilterQuery } from "mongoose";
import { BaseRepository } from "./base/BaseRepository";
import {
  IReviewRepository,
  IReviewFilterParams,
  IPaginatedReviews,
  IAdminReviewListItem,
} from "../../domain/interfaces/repositories/IReviewRepository";
import { reviewModel, IReviewDocument } from "../DB/models/reviewModel";
import { Review } from "../../domain/entities/review";
import { ReviewRepoMapper } from "./mappers/reviewRepoMapper";

export class ReviewRepository
  extends BaseRepository<IReviewDocument>
  implements IReviewRepository
{
  constructor() {
    super(reviewModel);
  }

  async create(data: Partial<Review>): Promise<Review> {
    const docData = {
      appointmentId: new Types.ObjectId(data.appointmentId),
      patientId: new Types.ObjectId(data.patientId),
      doctorId: new Types.ObjectId(data.doctorId),
      answers: {
        q1: data.answers?.q1,
        q2: data.answers?.q2,
        q3: data.answers?.q3,
        q4: data.answers?.q4,
        q5: data.answers?.q5,
      },
      score: data.score,
      comment: data.comment,
      isAnonymous: data.isAnonymous,
    };
    const [doc] = await this.model.create([docData]);
    return ReviewRepoMapper.toEntityFromDocument(doc);
  }

  async update(id: string, data: Partial<Review>): Promise<Review> {
    const updateData: {
      answers?: {
        q1?: string;
        q2?: string;
        q3?: string;
        q4?: string;
        q5?: string;
      };
      score?: number;
      comment?: string;
      isAnonymous?: boolean;
    } = {};
    if (data.answers) {
      updateData.answers = {
        q1: data.answers.q1,
        q2: data.answers.q2,
        q3: data.answers.q3,
        q4: data.answers.q4,
        q5: data.answers.q5,
      };
    }
    if (data.score !== undefined) {
      updateData.score = data.score;
    }
    if (data.comment !== undefined) {
      updateData.comment = data.comment;
    }
    if (data.isAnonymous !== undefined) {
      updateData.isAnonymous = data.isAnonymous;
    }

    const doc = await this.model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
    if (!doc) {
      throw new Error("Review not found for update");
    }
    return ReviewRepoMapper.toEntityFromDocument(doc);
  }

  async findByAppointmentId(appointmentId: string): Promise<Review | null> {
    if (!Types.ObjectId.isValid(appointmentId)) return null;
    const doc = await this.model.findOne({
      appointmentId: new Types.ObjectId(appointmentId),
    });
    return doc ? ReviewRepoMapper.toEntityFromDocument(doc) : null;
  }

  async findById(id: string): Promise<Review | null> {
    const doc = await this.findDocumentById(id);
    return doc ? ReviewRepoMapper.toEntityFromDocument(doc) : null;
  }

  async getPublicDoctorReviews(
    doctorId: string,
    page: number,
    limit: number,
  ): Promise<IPaginatedReviews> {
    const skip = (page - 1) * limit;
    const filter = { doctorId: new Types.ObjectId(doctorId) };
    const docs = await this.model
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await this.model.countDocuments(filter);
    const reviews = docs.map((doc) => ReviewRepoMapper.toEntityFromDocument(doc));

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async doctorListReviews(
    doctorId: string,
    page: number,
    limit: number,
    filters: IReviewFilterParams,
  ): Promise<IPaginatedReviews> {
    const skip = (page - 1) * limit;
    const query: FilterQuery<IReviewDocument> = { doctorId: new Types.ObjectId(doctorId) };

    if (filters.scoreMin !== undefined && filters.scoreMax !== undefined) {
      query.score = { $gte: filters.scoreMin, $lte: filters.scoreMax };
    } else if (filters.scoreMin !== undefined) {
      query.score = { $gte: filters.scoreMin };
    } else if (filters.scoreMax !== undefined) {
      query.score = { $lte: filters.scoreMax };
    }

    if (filters.startDate !== undefined && filters.endDate !== undefined) {
      query.createdAt = { $gte: filters.startDate, $lte: filters.endDate };
    } else if (filters.startDate !== undefined) {
      query.createdAt = { $gte: filters.startDate };
    } else if (filters.endDate !== undefined) {
      query.createdAt = { $lte: filters.endDate };
    }

    const docs = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await this.model.countDocuments(query);
    const reviews = docs.map((doc) => ReviewRepoMapper.toEntityFromDocument(doc));

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async adminListReviews(
    page: number,
    limit: number,
    filters: {
      search?: string;
      doctorName?: string;
      patientName?: string;
      scoreMin?: number;
      scoreMax?: number;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ): Promise<{
    reviews: IAdminReviewListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const matchQuery: FilterQuery<IReviewDocument> = {};
    if (filters.search) {
      matchQuery.comment = { $regex: filters.search, $options: "i" };
    }
    if (filters.scoreMin !== undefined && filters.scoreMax !== undefined) {
      matchQuery.score = { $gte: filters.scoreMin, $lte: filters.scoreMax };
    } else if (filters.scoreMin !== undefined) {
      matchQuery.score = { $gte: filters.scoreMin };
    } else if (filters.scoreMax !== undefined) {
      matchQuery.score = { $lte: filters.scoreMax };
    }
    if (filters.startDate && filters.endDate) {
      matchQuery.createdAt = { $gte: filters.startDate, $lte: filters.endDate };
    } else if (filters.startDate) {
      matchQuery.createdAt = { $gte: filters.startDate };
    } else if (filters.endDate) {
      matchQuery.createdAt = { $lte: filters.endDate };
    }

    const postLookupMatch: Record<string, unknown> = {};
    if (filters.doctorName) {
      postLookupMatch["doctor.name"] = { $regex: filters.doctorName, $options: "i" };
    }
    if (filters.patientName) {
      postLookupMatch["patient.name"] = { $regex: filters.patientName, $options: "i" };
    }

    const pipeline: PipelineStage[] = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "auths",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" },
      {
        $lookup: {
          from: "auths",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
    ];

    if (Object.keys(postLookupMatch).length > 0) {
      pipeline.push({ $match: postLookupMatch });
    }

    pipeline.push({
      $facet: {
        reviews: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              id: "$_id",
              appointmentId: 1,
              score: 1,
              comment: 1,
              answers: 1,
              isAnonymous: 1,
              createdAt: 1,
              patient: {
                id: "$patient._id",
                name: "$patient.name",
                email: "$patient.email",
              },
              doctor: {
                id: "$doctor._id",
                name: "$doctor.name",
              },
            },
          },
        ],
        total: [{ $count: "count" }],
      },
    });

    const [result] = await this.model.aggregate(pipeline);
    const reviews = result?.reviews ?? [];
    const total = result?.total?.[0]?.count ?? 0;

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
