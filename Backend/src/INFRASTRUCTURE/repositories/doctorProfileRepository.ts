import DoctorProfile, {
  DoctorProfilePopulated,
  DoctorProfileSpecializationPopulated,
} from "../../domain/entities/doctorProfile";
import {
  DoctorProfileModel,
  IDoctorProfilePopulatedDocument,
  IDoctorProfileSpecializationPopulatedDocument,
} from "../DB/models/doctorProfileModel";
import { IDoctorProfileRepository } from "../../domain/interfaces/repositories/IDoctorProfileRepository";
import { DoctorProfileMapper } from "../../application/mappers/doctorProfileMapper";
import {
  GetDoctorsRequestDTO,
  GetDoctorsResponseDTO,
} from "../../application/DTOs/doctor/doctorManagementDTO";
import {
  DemographicRaw,
  SpecializationTrendRaw,
} from "../../domain/interfaces/repositories/adminDashboardRepositoryTypes";
import { PipelineStage, Types } from "mongoose";
import { SpecializationMapper } from "../../application/mappers/specializationMapper";
import { AuthRepoMapper } from "./mappers/authRepoMapper";

export class DoctorProfileRepository implements IDoctorProfileRepository {
  constructor() {}

  async findByDoctorId(doctorId: string): Promise<DoctorProfile | null> {
    const profile = await DoctorProfileModel.findOne({ doctorId });
    if (!profile) return null;
    return DoctorProfileMapper.toEntityFromDocument(profile);
  }

  async findByDoctorIdSpecializationPopulated(
    doctorId: string,
  ): Promise<DoctorProfileSpecializationPopulated | null> {
    const profile = (await DoctorProfileModel.findOne({ doctorId }).populate(
      "specialization",
    )) as IDoctorProfileSpecializationPopulatedDocument;
    if (!profile) return null;
    return DoctorProfileMapper.toEntityFromSpecializationPopulatedDocument(
      profile,
    );
  }

  async findByDoctorIdPopulated(
    doctorId: string,
  ): Promise<DoctorProfilePopulated | null> {
    const profile = (await DoctorProfileModel.findOne({ doctorId }).populate([
      {
        path: "doctorId",
      },
      {
        path: "specialization",
      },
      {
        path: "practiceLocations.organizationId",
      },
    ])) as unknown as IDoctorProfilePopulatedDocument;
    if (!profile) return null;
    return {
      id: profile._id?.toString() ?? "",
      doctorId: AuthRepoMapper.toEntityFromDocument(profile.doctorId),
      profileImageUrl: profile.profileImageUrl,
      bannerImageUrl: profile.bannerImageUrl,
      dob: profile.dob,
      gender: profile.gender,
      phone: profile.phone,
      address: profile.address,
      about: profile.about,
      education: profile.education,
      experience: profile.experience,
      specialization: SpecializationMapper.toEntityFromDocument(
        profile.specialization!,
      ),
      certificates: profile.certificates,
      practiceType: profile.practiceType,
      practiceLocations: profile.practiceLocations,
      verificationStatus: profile.verificationStatus,
      verificationSubmissions: profile.verificationSubmissions,
      activeSubmissionId: profile.activeSubmissionId,
      acceptedTerms: profile.acceptedTerms,
      submissionDate: profile.submissionDate,
      isVisible: profile.isVisible,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async save(profile: DoctorProfile): Promise<DoctorProfile> {
    if (profile.id) {
      await DoctorProfileModel.findByIdAndUpdate(profile.id, {
        doctorId: profile.doctorId,
        profileImageUrl: profile.profileImageUrl,
        bannerImageUrl: profile.bannerImageUrl,
        dob: profile.dob,
        gender: profile.gender,
        phone: profile.phone,
        address: profile.address,
        about: profile.about,
        education: profile.education,
        experience: profile.experience,
        specialization: profile.specialization,
        certificates: profile.certificates,
        practiceType: profile.practiceType,
        practiceLocations: profile.practiceLocations,
        verificationStatus: profile.verificationStatus,
        verificationSubmissions: profile.verificationSubmissions,
        activeSubmissionId: profile.activeSubmissionId,
        acceptedTerms: profile.acceptedTerms,
        submissionDate: profile.submissionDate,
        isVisible: profile.isVisible,
        updatedAt: new Date(),
      });
      return profile;
    } else {
      const profileDoc = await DoctorProfileModel.create({
        doctorId: profile.doctorId,
        profileImageUrl: profile.profileImageUrl,
        bannerImageUrl: profile.bannerImageUrl,
        dob: profile.dob,
        gender: profile.gender,
        phone: profile.phone,
        address: profile.address,
        about: profile.about,
        education: profile.education,
        experience: profile.experience,
        specialization: profile.specialization,
        certificates: profile.certificates,
        practiceType: profile.practiceType,
        practiceLocations: profile.practiceLocations,
        verificationStatus: profile.verificationStatus,
        verificationSubmissions: profile.verificationSubmissions,
        activeSubmissionId: profile.activeSubmissionId,
        acceptedTerms: profile.acceptedTerms,
        submissionDate: profile.submissionDate,
        isVisible: profile.isVisible,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return DoctorProfileMapper.toEntityFromDocument(profileDoc);
    }
  }

  async getPublicDoctors(
    query: GetDoctorsRequestDTO,
  ): Promise<GetDoctorsResponseDTO> {
    const {
      search,
      specialization,
      location,
      consultationFee,
      consultationModes,
      sort,
      page,
      limit,
    } = query;
    const pipeline: PipelineStage[] = [];
    if (location?.length === 2) {
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: location as [number, number],
          },
          key: "practiceLocations.location",
          distanceField: "distance",
          spherical: true,
          maxDistance: 10000, // 10km in meters
        },
      });
    }
    pipeline.push(
      {
        $lookup: {
          from: "auths",
          localField: "doctorId",
          foreignField: "_id",
          as: "auth",
        },
      },
      { $unwind: "$auth" },
    );
    pipeline.push({
      $match: {
        "auth.role": "doctor",
        "auth.isBlocked": false,
        "auth.isNewUser": false,
        verificationStatus: "verified",
        acceptedTerms: true,
        isVisible: true,
      },
    });
    if (search) {
      pipeline.push({
        $match: {
          "auth.name": { $regex: search, $options: "i" },
        },
      });
    }
    if (specialization) {
      pipeline.push({
        $match: {
          specialization: new Types.ObjectId(specialization),
        },
      });
    }
    pipeline.push(
      {
        $lookup: {
          from: "specializations",
          localField: "specialization",
          foreignField: "_id",
          as: "specialization",
        },
      },
      { $unwind: "$specialization" },
    );
    pipeline.push({ $unwind: "$practiceLocations" });
    if (consultationFee !== undefined) {
      pipeline.push({
        $match: {
          "practiceLocations.consultationFee": {
            $gte: consultationFee,
          },
        },
      });
    }
    pipeline.push({
      $group: {
        _id: "$doctorId",
        name: { $first: "$auth.name" },
        profileImageUrl: { $first: "$profileImageUrl" },
        specialization: { $first: "$specialization.name" },
        minFee: { $min: "$practiceLocations.consultationFee" },
        maxFee: { $max: "$practiceLocations.consultationFee" },
        consultationModes: {
          $addToSet: "$practiceLocations.consultationModes",
        },
        location: {
          $first: "$practiceLocations.location.address",
        },
        nearestDistance: { $min: "$distance" },
        averageRating: { $first: "$averageRating" },
      },
    });
    pipeline.push({
      $project: {
        id: "$_id",
        name: 1,
        profileImageUrl: 1,
        specialization: 1,
        consultationFee: sort === "fee-desc" ? "$maxFee" : "$minFee",
        rating: { $ifNull: ["$averageRating", 0] },
        nextAvailableDate: { $literal: null },
        consultationModes: {
          $reduce: {
            input: "$consultationModes",
            initialValue: [],
            in: { $setUnion: ["$$value", "$$this"] },
          },
        },
        languages: { $literal: [] },
        location: 1,
        minFee: 1,
        maxFee: 1,
        nearestDistance: 1,
      },
    });
    if (consultationModes?.length) {
      pipeline.push({
        $match: {
          $expr: {
            $setIsSubset: [consultationModes, "$consultationModes"],
          },
        },
      });
    }
    switch (sort) {
      case "name-asc":
        pipeline.push({ $sort: { name: 1 } });
        break;

      case "name-desc":
        pipeline.push({ $sort: { name: -1 } });
        break;

      case "fee-asc":
        pipeline.push({ $sort: { minFee: 1 } });
        break;

      case "fee-desc":
        pipeline.push({ $sort: { maxFee: -1 } });
        break;

      case "location":
        pipeline.push({ $sort: { nearestDistance: 1 } });
        break;

      default:
        pipeline.push({ $sort: { name: 1 } });
    }
    pipeline.push({
      $facet: {
        doctors: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              id: 1,
              name: 1,
              specialization: 1,
              consultationFee: 1,
              rating: 1,
              nextAvailableDate: 1,
              consultationModes: 1,
              languages: 1,
              location: 1,
              profileImageUrl: 1,
            },
          },
        ],
        totalDocumentCount: [{ $count: "count" }],
      },
    });

    const [result] = await DoctorProfileModel.aggregate(pipeline);
    return {
      doctors: result?.doctors ?? [],
      totalDocumentCount: result?.totalDocumentCount?.[0]?.count ?? 0,
    };
  }

  async getGenderDemographics(): Promise<DemographicRaw[]> {
    return await DoctorProfileModel.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          label: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getAgeDemographics(): Promise<DemographicRaw[]> {
    return await DoctorProfileModel.aggregate([
      {
        $addFields: {
          age: {
            $dateDiff: {
              startDate: "$dob",
              endDate: "$$NOW",
              unit: "year",
            },
          },
        },
      },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 19, 36, 51, 66, 120],
          default: "Unknown",
          output: {
            count: { $sum: 1 },
          },
        },
      },
      {
        $project: {
          label: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "0-18" },
                { case: { $eq: ["$_id", 19] }, then: "19-35" },
                { case: { $eq: ["$_id", 36] }, then: "36-50" },
                { case: { $eq: ["$_id", 51] }, then: "51-65" },
                { case: { $eq: ["$_id", 66] }, then: "66+" },
              ],
              default: "Unknown",
            },
          },
          count: 1,
          _id: 0,
        },
      },
    ]);
  }

  async getSpecializationDistribution(): Promise<SpecializationTrendRaw[]> {
    return await DoctorProfileModel.aggregate([
      {
        $lookup: {
          from: "specializations",
          localField: "specialization",
          foreignField: "_id",
          as: "spec",
        },
      },
      { $unwind: "$spec" },
      {
        $group: {
          _id: "$spec.name",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async updateRating(doctorId: string, averageRating: number, reviewCount: number): Promise<void> {
    await DoctorProfileModel.findOneAndUpdate(
      { doctorId: new Types.ObjectId(doctorId) },
      { $set: { averageRating, reviewCount } },
    );
  }
}
