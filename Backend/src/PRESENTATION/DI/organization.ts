import { OrganizationController } from "../controllers/organization/organizationController";
import { OrganizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { ListOrganizationsUsecase } from "../../application/usecases/organization/listOrganizationsUsecase";

// Repositories
const organizationRepository = new OrganizationRepository();

// UseCases
const listOrganizationUsecase = new ListOrganizationsUsecase(
  organizationRepository,
);

// Controller
export const injectedOrganizationController = new OrganizationController(
  listOrganizationUsecase,
);
