import { GetSpecializationRequestDTO } from "../../application/DTOs/admin/getSpecializationRequestDTO";
import { SpecializationListDTO } from "../../application/DTOs/specializationDTO";
import { SpecializationMapper } from "../../application/mappers/specializationMapper";
import Specialization from "../../domain/entities/specialization";
import { ISpecializationRepository } from "../../domain/interfaces/repositories/ISpecializationRepository";
import { specializationModel } from "../DB/models/specializationModel";

export class SpecializationRepository implements ISpecializationRepository {
  constructor() {}

  async findByName(name: string): Promise<Specialization | null> {
    const specDoc = await specializationModel.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (specDoc) {
      return SpecializationMapper.toEntityFromDocument(specDoc);
    }
    return null;
  }

  async findById(id: string): Promise<Specialization | null> {
    const specDoc = await specializationModel.findById(id);
    if (specDoc) {
      return SpecializationMapper.toEntityFromDocument(specDoc);
    }
    return null;
  }

  async findAll(query: GetSpecializationRequestDTO): Promise<Specialization[]> {
    let sortQuery = {};
    if (query.sort === "alpha-asc") {
      sortQuery = { name: 1 };
    } else if (query.sort === "alpha-desc") {
      sortQuery = { name: -1 };
    } else {
      sortQuery = { createdAt: -1 };
    }
    const specializations = await specializationModel
      .find({
        $or: [
          { name: { $regex: query.search, $options: "i" } },
          { description: { $regex: query.search, $options: "i" } },
        ],
      })
      .collation({ locale: "en" })
      .sort(sortQuery)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit);
    return specializations.map((specDoc) =>
      SpecializationMapper.toEntityFromDocument(specDoc)
    );
  }

  async activate(id: string): Promise<void> {
    await specializationModel.findByIdAndUpdate(id, { isActive: true });
  }

  async deactivate(id: string): Promise<void> {
    await specializationModel.findByIdAndUpdate(id, { isActive: false });
  }

  async save(specialization: Specialization): Promise<void> {
    if (specialization.id) {
      await specializationModel.findByIdAndUpdate(
        specialization.id,
        {
          name: specialization.name,
          description: specialization.description,
          isActive: specialization.isActive,
          updatedAt: specialization.updatedAt,
        },
        { upsert: true }
      );
    } else {
      await specializationModel.insertOne({
        name: specialization.name,
        description: specialization.description,
        isActive: specialization.isActive,
        updatedAt: specialization.updatedAt,
      });
    }
  }

  async totalDocumentCount(
    query: GetSpecializationRequestDTO
  ): Promise<number> {
    return await specializationModel
      .find({
        $or: [
          { name: { $regex: query.search, $options: "i" } },
          { description: { $regex: query.search, $options: "i" } },
        ],
      })
      .countDocuments();
  }

  async getSpecializationList(): Promise<SpecializationListDTO[]> {
    const specializations = await specializationModel.find({isActive:true},{id:1,name:1});
    return specializations.map((specDoc) => SpecializationMapper.toSpecializationListDTOFromDocument(specDoc));
  }
}
