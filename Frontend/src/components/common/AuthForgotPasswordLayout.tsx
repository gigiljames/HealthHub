import { useState } from "react";
import AuthForgotPassword from "./AuthForgotPassword";
import AuthChangePassword from "./AuthChangePassword";
import { useNavigate } from "react-router";
// import AuthForgotPasswordOtp from "./AuthForgotPasswordOtp";
import AuthOTP from "./AuthOTP";
import toast from "react-hot-toast";

interface AuthForgotPasswordLayoutProps {
  role: string | "";
}

function AuthForgotPasswordLayout({ role }: AuthForgotPasswordLayoutProps) {
  document.title = "Recover account";
  const [stage, setStage] = useState<number>(1);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const navigate = useNavigate();
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

  async function handleOtp(email: string) {
    console.log(email);
    setShowOtpModal(false);
    toast.success("Verification successful. Please change your password.");
    setStage(2);
  }
  return (
    <>
      {showOtpModal ? (
        <AuthOTP
          length={6}
          message="An OTP has been sent to your registered email address. Enter the OTP here."
          bg={true}
          callback={handleOtp}
        />
      ) : null}
      <div className="flex items-start justify-center pt-10 mx-5">
        {chooseComponent(stage)}
      </div>
    </>
  );
}

export default AuthForgotPasswordLayout;
