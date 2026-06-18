import { IListPrescriptionsUseCase } from "../../../domain/interfaces/usecases/consultation/IListPrescriptionsUseCase";
import { IPrescriptionRepository, IPrescriptionFilterParams } from "../../../domain/interfaces/repositories/IPrescriptionRepository";
import {
  PrescriptionListFilterDTO,
  PaginatedPrescriptionsDTO,
} from "../../DTOs/consultation/prescriptionDTOs";
import { PrescriptionMapper } from "../../mappers/prescriptionMapper";
import { Roles } from "../../../domain/enums/roles";
import { authModel } from "../../../infrastructure/DB/models/authModel";
import { DoctorProfileModel } from "../../../infrastructure/DB/models/doctorProfileModel";
import { specializationModel } from "../../../infrastructure/DB/models/specializationModel";

export class ListPrescriptionsUseCase implements IListPrescriptionsUseCase {
  constructor(private readonly _prescriptionRepository: IPrescriptionRepository) {}

  async execute(
    userId: string,
    role: string,
    page: number,
    limit: number,
    filters: PrescriptionListFilterDTO,
  ): Promise<PaginatedPrescriptionsDTO> {
    const repoFilters: IPrescriptionFilterParams = {
      search: filters.search,
      specialization: filters.specialization,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(`${filters.endDate}T23:59:59.999Z`) : undefined,
    };

    let result;
    if (filters.patientId) {
      result = await this._prescriptionRepository.getPatientPrescriptions(filters.patientId, page, limit, repoFilters);
    } else if (role === Roles.DOCTOR) {
      result = await this._prescriptionRepository.getDoctorPrescriptions(userId, page, limit, repoFilters);
    } else {
      result = await this._prescriptionRepository.getPatientPrescriptions(userId, page, limit, repoFilters);
    }

    const prescriptionDTOs = await Promise.all(
      result.prescriptions.map(async (p) => {
        const patientDoc = await authModel.findById(p.patientId);
        const doctorDoc = await authModel.findById(p.doctorId);
        let specName = "";
        if (doctorDoc) {
          const docProfile = await DoctorProfileModel.findOne({ doctorId: doctorDoc._id });
          if (docProfile?.specialization) {
            const spec = await specializationModel.findById(docProfile.specialization);
            specName = spec?.name ?? "";
          }
        }
        return PrescriptionMapper.toDTO(
          p,
          doctorDoc?.name ?? "",
          specName,
          patientDoc?.name ?? "",
        );
      }),
    );

    return {
      prescriptions: prescriptionDTOs,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
