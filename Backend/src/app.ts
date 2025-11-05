/* eslint-disable @typescript-eslint/no-floating-promises */
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import express, { type Express } from "express";
import { UserRoute } from "./presentation/routes/userRoute/userRoute";
import cors from "cors";
import cookieParser from "cookie-parser";
import { MongoDB } from "./infrastructure/DB/config/MongoConfig";
import { AdminRoute } from "./presentation/routes/adminRoute/adminRoute";
import { AuthRoute } from "./presentation/routes/authRoute/authRoute";
import { errorHandlerMiddleware } from "./presentation/middlewares/errorHandlerMiddleware";
import { loggerMiddleware } from "./presentation/middlewares/loggerMiddleware";
import { logger } from "./utils/logger";

//*************TEST IMPORT**************
// import { EmailService } from "./2APPLICATION/services/emailService";
// import { IOtpEmailTemplate } from "./1DOMAIN/interfaces/emailTemplates/IOtpEmailTemplate";
// import { CachingService } from "./2APPLICATION/services/cachingService";
// import { OtpService } from "./2APPLICATION/services/otpService";
// import { UserModel } from "./3INFRASTRUCTURE/DB/models/userModel";
// import { UserRepository } from "./3INFRASTRUCTURE/repositories/userRepository";

class App {
  private _app: Express;
  constructor() {
    this._app = express();
    MongoDB.connect();
    this._setMiddlewares();
    this._setLoggerMiddleware();
    this._setAuthRoute();
    this._setUserRoute();
    this._setAdminRoute();
    this._setErrorHandlerMiddleware();
  }

  listen() {
    const PORT = process.env.PORT ?? 3000;
    this._app.listen(PORT, (err) => {
      if (err) {
        logger.error(err);
        logger.error("An error occured while starting the server.");
      } else {
        logger.info(`Server listening at PORT ${PORT}`);
      }
    });

    // **********TEST CODE************
    // const otp = "1234";
    // let emailOptions: IOtpEmailTemplate = {
    //   name: "Gigil James",
    //   email: "ashlygigil21@gmail.com",
    //   otp: otp,
    //   subject: "HealthHub registration OTP",
    // };
    // const cachingService = new CachingService();
    // const otpService = new OtpService(cachingService);
    // let otp = otpService.generateOtp();
    // console.log(otp);
    // console.log(otpService.verifyOtp(otp));
    // const emailService = new EmailService();
    // emailService.sendOtp("Gigil James", "ashlygigil21@gmail.com", {
    //   subject: "OTP for HealthHub",
    //   text: "OTP is 435434",
    //   html: "",
    // });
    // UserModel.insertOne({
    //   name: "Gigil",
    //   email: "ashlygigil21@gmail.com",
    //   dob: "10/10/2002",
    // });
    // let userRepo = new UserRepository(UserModel);
    // userRepo
    //   .findByEmail("ashlygigil21@gmail.com")
    //   .then((data) => console.log(data));
  }

  private _setAuthRoute() {
    const authRoute = new AuthRoute();
    this._app.use("/", authRoute.authRouter);
  }

  private _setUserRoute() {
    const userRoute = new UserRoute();
    this._app.use("/", userRoute.userRouter);
  }

  private _setAdminRoute() {
    const adminRoute = new AdminRoute();
    this._app.use("/admin", adminRoute.adminRouter);
  }

  private _setMiddlewares() {
    this._app.use(
      cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
      })
    );
    this._app.use(express.json());
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
