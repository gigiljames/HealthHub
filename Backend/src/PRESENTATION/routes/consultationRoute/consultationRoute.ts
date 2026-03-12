import { Router } from "express";
import { consultationController } from "../../DI/consultationControllers";
import { authMiddleware } from "../../middlewares/authMiddleware";
import TokenService from "../../../application/services/tokenService";
import { AuthRepository } from "../../../infrastructure/repositories/authRepository";
import { Roles } from "../../../domain/enums/roles";
import { ROUTES } from "../../../domain/constants/routes";

const tokenService = new TokenService();
const authRepository = new AuthRepository();

export class ConsultationRoute {
  public consultationRouter: Router;

  constructor() {
    this.consultationRouter = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.consultationRouter.post(
      ROUTES.CONSULTATION.JOIN_CONSULTATION,
      authMiddleware([Roles.USER, Roles.DOCTOR], tokenService, authRepository),
      consultationController.joinConsultation.bind(
        consultationController,
      ) as any,
    );

    this.consultationRouter.post(
      ROUTES.CONSULTATION.END_CONSULTATION,
      authMiddleware([Roles.DOCTOR], tokenService, authRepository),
      consultationController.endConsultation.bind(
        consultationController,
      ) as any,
    );
  }
}
