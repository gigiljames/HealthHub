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
  DoctorListItemDTO,
  GetDoctorsRequestDTO,
  GetDoctorsResponseDTO,
} from "../../application/DTOs/doctor/doctorManagementDTO";
import { Types } from "mongoose";
import { AuthMapper } from "../../application/mappers/authMapper";
import { SpecializationMapper } from "../../application/mappers/specializationMapper";

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
      id: profile._id?.toString()!,
      doctorId: AuthMapper.toEntityFromDocument(profile.doctorId),
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
    const pipeline: any[] = [];
    // location search
    if (location?.length === 2) {
      pipeline.push({
        $geoNear: {
          near: {
            type: "Point",
            coordinates: location,
          },
          key: "practiceLocations.location",
          distanceField: "distance",
          spherical: true,
          maxDistance: 10000, // 10km in meters
        },
      });
    }
    // populating auth
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
    // matching role = doctor, isBlocked = false, isNewUser = false, approved profile, accepted terms, profile is set to visible
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
    // name search
    if (search) {
      pipeline.push({
        $match: {
          "auth.name": { $regex: search, $options: "i" },
        },
      });
    }
    // specilization filter
    if (specialization) {
      pipeline.push({
        $match: {
          specialization: new Types.ObjectId(specialization),
        },
      });
    }
    // populating specialization
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
    // unwinding practiceLocations
    pipeline.push({ $unwind: "$practiceLocations" });
    // consultation fee filter
    if (consultationFee !== undefined) {
      pipeline.push({
        $match: {
          "practiceLocations.consultationFee": {
            $gte: consultationFee,
          },
        },
      });
    }
    // grouping with doctorId
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
      },
    });
    // flatten consultationModes
    pipeline.push({
      $project: {
        id: "$_id",
        name: 1,
        profileImageUrl: 1,
        specialization: 1,
        consultationFee: "$minFee",
        rating: { $literal: 0 },
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
    // consultation modes filter
    if (consultationModes?.length) {
      pipeline.push({
        $match: {
          $expr: {
            $setIsSubset: [consultationModes, "$consultationModes"],
          },
        },
      });
    }
    // sorting
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
    // skip, limit, total count
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
}
