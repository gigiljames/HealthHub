import React, { useRef, useState } from "react";
import AuthInput from "./AuthInput";
import AuthSubmitButton from "./AuthSubmitButton";

interface AuthForgotPasswordProps {
  setShowOtpModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function AuthForgotPassword({ setShowOtpModal }: AuthForgotPasswordProps) {
  const emailErrorRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const emailRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailErrorRef.current) {
      emailErrorRef.current.innerText = "";
    }
    setLoading(true);
    let validForm = true;
    if (emailErrorRef.current) {
      emailErrorRef.current.innerText = "";
    }
    if (!email) {
      if (emailErrorRef.current) {
        emailErrorRef.current.innerText = "Please enter your email.";
      }
      validForm = false;
    } else if (!emailRegex.test(email)) {
      if (emailErrorRef.current) {
        emailErrorRef.current.innerText = "Please enter a valid email.";
      }
      validForm = false;
    }

    if (validForm) {
      setShowOtpModal(true);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="bg-white shadow-[0_0_10px_rgba(0,0,0,0.15)] w-fit px-9 py-13 rounded-2xl">
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <img
            src="/Logo_with_text_black.png"
            alt="HealthHub logo with text"
            className="mb-4 h-[60px]"
          />
          <p className="font-bold text-2xl lg:text-4xl text-center mb-4">
            Find your account
          </p>
          <p className="text-center text-sm md:text-[16px] mb-3 font-medium max-w-[300px] lg:max-w-[350px]">
            Please enter your registered email address to search for your
            account.
          </p>
          <div className="w-full mb-1">
            <div className="flex justify-center gap-4">
              <AuthInput
                placeholder="Enter your email address"
                type="text"
                ref={emailRef}
                setChange={setEmail}
              />
            </div>
            <div ref={emailErrorRef} className="text-red-600 pl-3.5"></div>
          </div>
          <AuthSubmitButton title="Proceed" loading={loading} />
        </form>
      </div>
    </>
  );
}

export default AuthForgotPassword;
