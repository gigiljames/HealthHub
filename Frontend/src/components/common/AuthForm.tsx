import { useState } from "react";
import AuthOTP from "./AuthOTP";
import AuthSignupForm from "./AuthSignupForm";
import AuthLoginForm from "./AuthLoginForm";

interface AuthFormProps {
  role: string;
  signUpMessage: string;
  loginMessage: string;
}

function AuthForm({ role, loginMessage, signUpMessage }: AuthFormProps) {
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  async function handleOtp() {}
  return (
    <>
      {showOtpModal ? (
        <AuthOTP
          length={6}
          message="An OTP has been sent to your registered email address. Enter the OTP here."
          callback={handleOtp}
          bg={true}
        />
      ) : null}
      <div className="lg:hidden flex flex-row justify-center items-center h-[100vh] w-[100vw] bg-white">
        <div className="w-[98%] rounded-xl flex flex-col items-center justify-center">
          {isLogin ? (
            <>
              <AuthLoginForm setIsLogin={setIsLogin} role="role" />
            </>
          ) : (
            <>
              <AuthSignupForm
                setIsLogin={setIsLogin}
                setShowOtpModal={setShowOtpModal}
                role={role}
              />
            </>
          )}
        </div>
      </div>
      <div className="hidden lg:flex flex-row justify-center items-center h-[100vh] w-[100vw] bg-white ">
        <div className="flex flex-row relative min-h-[550px] w-[880px] shadow-[0_0_10px_rgba(0,0,0,0.15)] bg-white rounded-4xl">
          <div className="title-board flex flex-col items-center justify-center absolute top-0 h-full w-[440px] p-11  bg-lightGreen rounded-4xl gap-6 shadow-[0_0_10px_rgba(0,0,0,0.25)] z-10">
            <img src="/Logo_with_text.png" />
            {isLogin ? (
              <p className="text-center text-xl font-semibold">
                {loginMessage}
              </p>
            ) : (
              <p className="text-center text-xl font-semibold">
                {signUpMessage}
              </p>
            )}

            {/* text-[#e5e3dc]" */}
          </div>
          <AuthSignupForm
            setIsLogin={setIsLogin}
            setShowOtpModal={setShowOtpModal}
            role={role}
          />
          <AuthLoginForm setIsLogin={setIsLogin} role={role} />
        </div>
      </div>
    </>
  );
}

export default AuthForm;
