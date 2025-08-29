import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import type { Express } from "express";
import express from "express";
import { UserRoute } from "./4PRESENTATION/routes/userRoute/userRoute";
import cors from "cors";

//*************TEST IMPORT**************
// import { EmailService } from "./2APPLICATION/services/emailService";
// import { IOtpEmailTemplate } from "./1DOMAIN/interfaces/emailTemplates/IOtpEmailTemplate";
// import { CachingService } from "./2APPLICATION/services/cachingService";
// import { OtpService } from "./2APPLICATION/services/otpService";

class App {
  private app: Express;
  constructor() {
    this.app = express();
    this.setMiddlewares();
    this.setUserRoute();
  }

  listen() {
    const PORT = process.env.PORT ?? 3000;
    this.app.listen(PORT, (err) => {
      if (err) {
        console.log(err);
        console.log("An error occured while starting the server.");
      } else {
        console.log(`Server listening at PORT - ${PORT}`);
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
  }

  private setUserRoute() {
    const userRoute = new UserRoute();
    this.app.use("/", userRoute.userRouter);
  }

  setMiddlewares() {
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
      })
    );
    this.app.use(express.json());
  }
}

const app = new App();
app.listen();
