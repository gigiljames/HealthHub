import { authModel } from "../infrastructure/DB/models/authModel";
import { walletModel } from "../infrastructure/DB/models/walletModel";
import { Roles } from "../domain/enums/roles";
import { HashService } from "../application/services/hashService";

export const initAdminWallet = async () => {
  try {
    let admin = await authModel.findOne({ email: "admin@gmail.com" });

    if (!admin) {
      const hashService = new HashService();
      const passwordHash = await hashService.hash("admin123");
      admin = await authModel.create({
        name: "Admin",
        email: "admin@gmail.com",
        passwordHash,
        role: Roles.ADMIN,
        profileModel: "UserProfile",
        isBlocked: false,
        isNewUser: false,
        onboardingStep: 0,
      });
      console.log("[Init] Admin user created with email: admin@gmail.com");
    }

    const wallet = await walletModel.findOne({ userId: admin._id });
    if (!wallet) {
      await walletModel.create({
        userId: admin._id,
        currency: "INR",
        balance: 0,
      });
      console.log("[Init] Admin wallet created.");
    }
  } catch (error) {
    console.error("[Init] Error initializing admin wallet:", error);
  }
};
