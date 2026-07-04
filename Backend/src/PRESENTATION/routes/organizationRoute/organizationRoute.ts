import { Router } from "express";
import { ROUTES } from "../../../domain/constants/routes";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import TokenService from "../../../application/services/tokenService";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { Roles } from "../../../domain/enums/roles";
import { injectedOrganizationController } from "../../DI/organization";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class OrganizationRoute {
  organizationRouter: Router;
  constructor() {
    this.organizationRouter = Router();
    this._setRoutes();
  }

  private _setRoutes() {
    // List verified/active organizations
    this.organizationRouter.get(
      ROUTES.ORGANIZATION.LIST_ORGANIZATIONS,
      authMiddleware([Roles.DOCTOR, Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedOrganizationController.listOrganizations(req, res, next);
      },
    );

    // Get organization profile by ID
    this.organizationRouter.get(
      ROUTES.ORGANIZATION.GET_ORGANIZATION_PROFILE,
      authMiddleware([Roles.DOCTOR, Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedOrganizationController.adminGetOrganizationById(req, res, next);
      },
    );

    // Enrolment (Public)
    this.organizationRouter.post(
      ROUTES.ORGANIZATION.ENROL_ORGANIZATION,
      (req, res, next) => {
        injectedOrganizationController.enrolOrganization(req, res, next);
      },
    );

    // Confirm Enrolment (Public)
    this.organizationRouter.post(
      ROUTES.ORGANIZATION.CONFIRM_ENROLMENT,
      (req, res, next) => {
        injectedOrganizationController.confirmEnrolment(req, res, next);
      },
    );

    // Send Status OTP (Public)
    this.organizationRouter.post(
      ROUTES.ORGANIZATION.SEND_STATUS_OTP,
      (req, res, next) => {
        injectedOrganizationController.sendStatusOtp(req, res, next);
      },
    );

    // Check Status (Public)
    this.organizationRouter.post(
      ROUTES.ORGANIZATION.CHECK_STATUS,
      (req, res, next) => {
        injectedOrganizationController.checkStatus(req, res, next);
      },
    );

    // Resubmit Rejected Enrolment (Public)
    this.organizationRouter.post(
      ROUTES.ORGANIZATION.RESUBMIT_ENROLMENT,
      (req, res, next) => {
        injectedOrganizationController.resubmitEnrolment(req, res, next);
      },
    );

    // Doctor Organization Lookup by Code
    this.organizationRouter.get(
      ROUTES.ORGANIZATION.GET_ORGANIZATION_BY_CODE,
      authMiddleware([Roles.DOCTOR, Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedOrganizationController.getOrganizationByCode(req, res, next);
      },
    );

    // Admin List Organizations
    this.organizationRouter.get(
      ROUTES.ORGANIZATION.ADMIN_LIST_ORGANIZATIONS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedOrganizationController.adminListOrganizations(req, res, next);
      },
    );

    // Admin Get Organization by ID
    this.organizationRouter.get(
      ROUTES.ORGANIZATION.ADMIN_GET_ORGANIZATION_BY_ID,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedOrganizationController.adminGetOrganizationById(req, res, next);
      },
    );

    // Admin Update Organization Status (Approve/Reject/Block/Unblock)
    this.organizationRouter.patch(
      ROUTES.ORGANIZATION.ADMIN_UPDATE_ORGANIZATION_STATUS,
      authMiddleware([Roles.ADMIN], tokenService, authRepository),
      (req, res, next) => {
        injectedOrganizationController.adminUpdateOrganizationStatus(req, res, next);
      },
    );
  }
}
