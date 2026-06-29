import { OrganizationController } from "../controllers/organization/organizationController";
import { OrganizationRepository } from "../../infrastructure/repositories/organizationRepository";
import { ListOrganizationsUsecase } from "../../application/usecases/organization/listOrganizationsUsecase";
import { EnrolOrganizationUseCase } from "../../application/usecases/organization/EnrolOrganizationUseCase";
import { ConfirmEnrolmentUseCase } from "../../application/usecases/organization/ConfirmEnrolmentUseCase";
import { SendStatusOtpUseCase } from "../../application/usecases/organization/SendStatusOtpUseCase";
import { CheckStatusUseCase } from "../../application/usecases/organization/CheckStatusUseCase";
import { ResubmitEnrolmentUseCase } from "../../application/usecases/organization/ResubmitEnrolmentUseCase";
import { GetOrganizationByCodeUseCase } from "../../application/usecases/organization/GetOrganizationByCodeUseCase";
import { AdminListOrganizationsUseCase } from "../../application/usecases/organization/AdminListOrganizationsUseCase";
import { GetOrganizationByIdUseCase } from "../../application/usecases/organization/GetOrganizationByIdUseCase";
import { AdminUpdateOrganizationStatusUseCase } from "../../application/usecases/organization/AdminUpdateOrganizationStatusUseCase";
import { CachingService } from "../../application/services/cachingService";
import { EmailService } from "../../application/services/emailService";
import { OtpService } from "../../application/services/otpService";

// Services
const cachingService = new CachingService();
const emailService = new EmailService();
const otpService = new OtpService(cachingService);

// Repositories
const organizationRepository = new OrganizationRepository();

// UseCases
const listOrganizationUsecase = new ListOrganizationsUsecase(
  organizationRepository,
);
const enrolOrganizationUsecase = new EnrolOrganizationUseCase(
  organizationRepository,
  otpService,
  emailService,
);
const confirmEnrolmentUsecase = new ConfirmEnrolmentUseCase(
  organizationRepository,
  otpService,
);
const sendStatusOtpUsecase = new SendStatusOtpUseCase(
  organizationRepository,
  otpService,
  emailService,
);
const checkStatusUsecase = new CheckStatusUseCase(
  organizationRepository,
  otpService,
);
const resubmitEnrolmentUsecase = new ResubmitEnrolmentUseCase(
  organizationRepository,
  otpService,
);
const getOrganizationByCodeUsecase = new GetOrganizationByCodeUseCase(
  organizationRepository,
);
const adminListOrganizationsUsecase = new AdminListOrganizationsUseCase(
  organizationRepository,
);
const getOrganizationByIdUsecase = new GetOrganizationByIdUseCase(
  organizationRepository,
);
const adminUpdateOrganizationStatusUsecase =
  new AdminUpdateOrganizationStatusUseCase(
    organizationRepository,
    emailService,
  );

// Controller
export const injectedOrganizationController = new OrganizationController(
  listOrganizationUsecase,
  enrolOrganizationUsecase,
  confirmEnrolmentUsecase,
  sendStatusOtpUsecase,
  checkStatusUsecase,
  resubmitEnrolmentUsecase,
  getOrganizationByCodeUsecase,
  adminListOrganizationsUsecase,
  getOrganizationByIdUsecase,
  adminUpdateOrganizationStatusUsecase,
);
