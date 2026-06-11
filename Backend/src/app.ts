/* eslint-disable @typescript-eslint/no-floating-promises */
import { env } from "./config/envConfig";
import http from "http";
import { socketService } from "./infrastructure/socket/SocketIOService";
import express, { type Express } from "express";
import { UserRoute } from "./presentation/routes/userRoute/userRoute";
import cors from "cors";
import cookieParser from "cookie-parser";
import { AdminRoute } from "./presentation/routes/adminRoute/adminRoute";
import { AuthRoute } from "./presentation/routes/authRoute/authRoute";
import { errorHandlerMiddleware } from "./presentation/middlewares/errorHandlerMiddleware";
import { loggerMiddleware } from "./presentation/middlewares/loggerMiddleware";
import { logger } from "./utils/logger";
import { MongoDB } from "./infrastructure/DB/config/MongoConfig";
// import { initAdminWallet } from "./utils/initAdminWallet";
import { DoctorRoute } from "./presentation/routes/doctorRoute/doctorRoute";
import { SpecializationRoute } from "./presentation/routes/specializationRoute/specializationRoute";
import { SlotRoute } from "./presentation/routes/slotRoute/slotRoute";
import { OrganizationRoute } from "./presentation/routes/organizationRoute/organizationRoute";
import { AppointmentRoute } from "./presentation/routes/appointmentRoute/appointmentRoute";
import { ConsultationRoute } from "./presentation/routes/consultationRoute/consultationRoute";
import { PayoutRoute } from "./presentation/routes/payoutRoute/payoutRoute";
import { WebhookRoute } from "./presentation/routes/webhookRoute/webhookRoute";
import { ROUTES } from "./domain/constants/routes";
import { weeklyPayoutCron } from "./presentation/DI/payout";
import { notificationCronService } from "./presentation/DI/notification";
import { S3Route } from "./presentation/routes/s3Route/s3Route";
import { NotificationRoute } from "./presentation/routes/notificationRoute/notificationRoute";
import { ReviewRoute } from "./presentation/routes/reviewRoute/reviewRoute";

//*************TEST IMPORT**************
// import { EmailService } from "./2APPLICATION/services/emailService";
// import { IOtpEmailTemplate } from "./1DOMAIN/interfaces/emailTemplates/IOtpEmailTemplate";
// import { CachingService } from "./2APPLICATION/services/cachingService";
// import { OtpService } from "./2APPLICATION/services/otpService";
// import { UserModel } from "./3INFRASTRUCTURE/DB/models/userModel";
// import { UserRepository } from "./3INFRASTRUCTURE/repositories/userRepository";
// import { OrganizationModel } from "./infrastructure/DB/models/organizationModel";
// import { OrganizationType } from "./domain/enums/organizationType";

// OrganizationModel.insertMany([
//   {
//     name: "Apollo Hospitals",
//     organizationType: OrganizationType.HOSPITAL,
//     location: {
//       type: "Point",
//       coordinates: [77.5946, 12.9716], // [longitude, latitude]
//       address: "Bannerghatta Road, Bengaluru, Karnataka, India",
//       placeId: "ChIJ6dJmKZ0VrjsR7Y1HnF2F9XE",
//     },
//     accountHolderName: "Apollo Hospitals Pvt Ltd",
//     bankName: "HDFC Bank",
//     accountNumber: "123456789012",
//     ifscCode: "HDFC0001234",
//     upiId: "apollo@hdfcbank",
//     isVerified: true,
//   },
//   {
//     name: "HealthPlus Diagnostics",
//     organizationType: OrganizationType.DIAGNOSTIC_CENTER,
//     location: {
//       type: "Point",
//       coordinates: [72.8777, 19.076],
//       address: "Andheri East, Mumbai, Maharashtra, India",
//       placeId: "ChIJwe1EZjDG5zsRaYxkjY_tpF0",
//     },
//     accountHolderName: "HealthPlus Diagnostics LLP",
//     bankName: "ICICI Bank",
//     accountNumber: "987654321098",
//     ifscCode: "ICIC0005678",
//     upiId: "healthplus@icici",
//     isVerified: false,
//   },
//   {
//     name: "CareWell Clinic",
//     organizationType: OrganizationType.CLINIC,
//     location: {
//       type: "Point",
//       coordinates: [88.3639, 22.5726],
//       address: "Salt Lake, Kolkata, West Bengal, India",
//       placeId: "ChIJZ_YISduC-DkRvG6x7OqT6Zw",
//     },
//     accountHolderName: "CareWell Clinic",
//     bankName: "State Bank of India",
//     accountNumber: "112233445566",
//     ifscCode: "SBIN0000456",
//     upiId: "carewell@sbi",
//     isVerified: true,
//   },
// ]);

class App {
  private _app: Express;
  private _server: http.Server;
  constructor() {
    this._app = express();
    this._server = http.createServer(this._app);
    MongoDB.connect().then(() => {
      // initAdminWallet();
      weeklyPayoutCron.start();
      notificationCronService.start();
    });
    this._setWebhookRoute();
    this._setMiddlewares();
    this._setLoggerMiddleware();
    this._setAuthRoute();
    this._setUserRoute();
    this._setDoctorRoute();
    this._setAdminRoute();
    this._setSpecializationRoute();
    this._setSlotRoute();
    this._setOrganizationRoute();
    this._setAppointmentRoute();
    this._setConsultationRoute();
    this._setPayoutRoute();
    this._setS3Route();
    this._setNotificationRoute();
    this._setReviewRoute();
    this._setErrorHandlerMiddleware();
  }

  listen() {
    socketService.initialize(this._server);

    const PORT = env.PORT ?? 3000;
    this._server.listen(PORT, () => {
      logger.info(`Server listening at PORT ${PORT}`);
    });

    // **********TEST CODE************
  }

  private _setAuthRoute() {
    const authRoute = new AuthRoute();
    this._app.use("/", authRoute.authRouter);
  }

  private _setUserRoute() {
    const userRoute = new UserRoute();
    this._app.use("/", userRoute.userRouter);
  }

  private _setDoctorRoute() {
    const doctorRoute = new DoctorRoute();
    this._app.use("/", doctorRoute.doctorRouter);
  }

  private _setAdminRoute() {
    const adminRoute = new AdminRoute();
    this._app.use("/", adminRoute.adminRouter);
  }

  private _setSpecializationRoute() {
    const specializationRoute = new SpecializationRoute();
    this._app.use("/", specializationRoute.specializationRouter);
  }

  private _setSlotRoute() {
    const slotRoute = new SlotRoute();
    this._app.use("/", slotRoute.slotRouter);
  }

  private _setOrganizationRoute() {
    const organizationRoute = new OrganizationRoute();
    this._app.use("/", organizationRoute.organizationRouter);
  }

  private _setAppointmentRoute() {
    const appointmentRoute = new AppointmentRoute();
    this._app.use("/", appointmentRoute.appointmentRouter);
  }

  private _setConsultationRoute() {
    const consultationRoute = new ConsultationRoute();
    this._app.use("/", consultationRoute.consultationRouter);
  }

  private _setPayoutRoute() {
    const payoutRoute = new PayoutRoute();
    this._app.use("/", payoutRoute.payoutRouter);
  }

  private _setWebhookRoute() {
    const webhookRoute = new WebhookRoute();
    this._app.use("/", webhookRoute.webhookRouter);
  }

  private _setS3Route() {
    const s3Route = new S3Route();
    this._app.use("/", s3Route.s3Router);
  }

  private _setNotificationRoute() {
    const notificationRoute = new NotificationRoute();
    this._app.use("/notifications", notificationRoute.notificationRouter);
  }

  private _setReviewRoute() {
    const reviewRoute = new ReviewRoute();
    this._app.use("/", reviewRoute.reviewRouter);
  }

  private _setMiddlewares() {
    this._app.use(
      cors({
        origin: env.FRONTEND_URL,
        credentials: true,
      }),
    );
    this._app.use((req, res, next) => {
      if (req.originalUrl === ROUTES.WEBHOOK.STRIPE) {
        return next();
      }
      express.json()(req, res, next);
    });
    this._app.use(cookieParser());
  }

  private _setErrorHandlerMiddleware() {
    this._app.use(errorHandlerMiddleware);
  }

  private _setLoggerMiddleware() {
    this._app.use(loggerMiddleware);
  }
}

const app = new App();
app.listen();
