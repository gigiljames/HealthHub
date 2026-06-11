import { IDoctorListReviewsUseCase } from "../../../domain/interfaces/usecases/review/IDoctorListReviewsUseCase";
import { IReviewRepository } from "../../../domain/interfaces/repositories/IReviewRepository";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { PaginatedReviewsDTO } from "../../DTOs/review/reviewDTOs";
import { ReviewMapper } from "../../mappers/reviewMapper";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { userProfileModel } from "../../../infrastructure/DB/models/userProfileModel";

export class DoctorListReviewsUseCase implements IDoctorListReviewsUseCase {
  constructor(
    private readonly _reviewRepository: IReviewRepository,
    private readonly _s3Service: IS3Service,
  ) { }

  async execute(
    doctorId: string,
    page: number,
    limit: number,
    filters: { scoreMin?: number; scoreMax?: number; startDate?: string; endDate?: string },
  ): Promise<PaginatedReviewsDTO> {
    const filterParams: any = {
      scoreMin: filters.scoreMin,
      scoreMax: filters.scoreMax,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };

    const paginated = await this._reviewRepository.doctorListReviews(
      doctorId,
      page,
      limit,
      filterParams,
    );
    const reviewsDTO = [];

    for (const review of paginated.reviews) {
      if (review.isAnonymous) {
        reviewsDTO.push(
          ReviewMapper.toDTO(review, {
            name: "Anonymous Patient",
            profileImageUrl: "",
          }),
        );
      } else {
        const patientAuth = await authModel.findById(review.patientId);
        const patientProfile = await userProfileModel.findOne({ userId: review.patientId });

        let signedUrl = "";
        if (patientProfile?.profileImageUrl) {
          try {
            signedUrl = await this._s3Service.getAccessSignedUrl(patientProfile.profileImageUrl);
          } catch (e) {
            signedUrl = "";
          }
        }

        reviewsDTO.push(
          ReviewMapper.toDTO(review, {
            name: patientAuth?.name || "Patient",
            profileImageUrl: signedUrl,
          }),
        );
      }
    }

    return {
      reviews: reviewsDTO,
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
      totalPages: paginated.totalPages,
    };
  }
}
