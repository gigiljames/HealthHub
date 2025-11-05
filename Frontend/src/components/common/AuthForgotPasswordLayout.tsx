import { useState } from "react";
import AuthForgotPassword from "./AuthForgotPassword";
import AuthChangePassword from "./AuthChangePassword";
import { useNavigate } from "react-router";
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
        return <AuthForgotPassword setShowOtpModal={setShowOtpModal} />;
      case 2:
        return <AuthChangePassword setStage={setStage} />;
      case 4:
        if (role) navigate(`/${role}/auth`);
        else navigate("/auth");
        break;
      default:
        return <AuthForgotPassword setShowOtpModal={setShowOtpModal} />;
    }
  }

  async function handleOtp(otp: string) {
    try {
      const data = await forgotPasswordVerifyOtp(otp, email);
      if (data.success) {
        toast.success(
          data?.message ||
            "Verification successful. Please change your password."
        );
        dispatch(setToken(data.token));
        setShowOtpModal(false);
        setStage(2);
      } else {
        throw new Error(
          data?.message || "An error occured while verifying otp."
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
      <div className="flex items-start justify-center pt-10 mx-5">
        {chooseComponent(stage)}
      </div>
    </>
  );
}

export default AuthForgotPasswordLayout;
