import { IReviewRepository } from "../../../domain/interfaces/repositories/IReviewRepository";
import { IS3Service } from "../../../domain/interfaces/services/IS3Service";
import { IGetPublicDoctorReviewsUseCase } from "../../../domain/interfaces/usecases/review/IGetPublicDoctorReviewsUseCase";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { userProfileModel } from "../../../infrastructure/DB/models/userProfileModel";
import { PaginatedReviewsDTO } from "../../DTOs/review/reviewDTOs";
import { ReviewMapper } from "../../mappers/reviewMapper";


export class GetPublicDoctorReviewsUseCase implements IGetPublicDoctorReviewsUseCase {
  constructor(
    private readonly _reviewRepository: IReviewRepository,
    private readonly _s3Service: IS3Service,
  ) { }

  async execute(doctorId: string, page: number, limit: number): Promise<PaginatedReviewsDTO> {
    const paginated = await this._reviewRepository.getPublicDoctorReviews(doctorId, page, limit);
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
          } catch {
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
