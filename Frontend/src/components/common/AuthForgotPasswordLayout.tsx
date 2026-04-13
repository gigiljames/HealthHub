import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AuthForgotPassword from "./AuthForgotPassword";
import AuthChangePassword from "./AuthChangePassword";
import { useNavigate } from "react-router";
// ... (rest of imports)
import UGuestNavbar from "../user/UGuestNavbar";
import DGuestNavbar from "../doctor/DGuestNavbar";
// import AuthForgotPasswordOtp from "./AuthForgotPasswordOtp";
import AuthOTP from "./AuthOTP";
import toast from "react-hot-toast";
import {
  forgotPasswordResendOtp,
  forgotPasswordVerifyOtp,
} from "../../api/auth/authService";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { setToken } from "../../state/auth/forgotPasswordSlice";

interface AuthForgotPasswordLayoutProps {
  role: string | "";
}

function AuthForgotPasswordLayout({ role }: AuthForgotPasswordLayoutProps) {
  document.title = "Recover account";
  const email = useSelector((state: RootState) => state.forgotPassword.email);
  const [stage, setStage] = useState<number>(1);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  function chooseComponent(stage: number) {
    switch (stage) {
      case 1:
        return (
          <AuthForgotPassword
            key="forgot-email"
            setShowOtpModal={setShowOtpModal}
          />
        );
      case 2:
        return <AuthChangePassword key="change-password" setStage={setStage} />;
      case 4:
        if (role) navigate(`/${role}/login`);
        else navigate("/login");
        break;
      default:
        return (
          <AuthForgotPassword
            key="forgot-email"
            setShowOtpModal={setShowOtpModal}
          />
        );
    }
  }

  async function handleOtp(otp: string) {
    try {
      const data = await forgotPasswordVerifyOtp(otp, email);
      if (data.success) {
        toast.success(
          data?.message ||
            "Verification successful. Please change your password.",
        );
        dispatch(setToken(data.token));
        setShowOtpModal(false);
        setStage(2);
      } else {
        throw new Error(
          data?.message || "An error occured while verifying otp.",
        );
      }
    } catch (error) {
      console.log(error);
      toast.error((error as Error)?.message || "API connection error.");
    }
  }
  async function handleResendOtp() {
    const data = await forgotPasswordResendOtp(email);
    if (data.success) {
      toast.success(data.message ?? "OTP resent successfully");
    } else {
      toast.error(data.message ?? "An error occured while resending OTP");
    }
  }
  return (
    <>
      {showOtpModal ? (
        <AuthOTP
          length={6}
          message="An OTP has been sent to your registered email address. Enter the OTP here."
          bg={true}
          callback={handleOtp}
          resendOtpCallback={handleResendOtp}
        />
      ) : null}
      <div className="w-full min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
        {role === "doctor" ? <DGuestNavbar /> : <UGuestNavbar />}
        <div className="flex flex-row justify-center items-center pt-[70px] min-h-screen w-full pb-10">
          <AnimatePresence mode="wait">
            {chooseComponent(stage)}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

export default AuthForgotPasswordLayout;
