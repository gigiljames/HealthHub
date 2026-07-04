import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import AuthInput from "./AuthInput";
import AuthSubmitButton from "./AuthSubmitButton";
import toast from "react-hot-toast";
import { forgotPassword } from "../../api/auth/authService";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { setEmail } from "../../state/auth/forgotPasswordSlice";

interface AuthForgotPasswordProps {
  setShowOtpModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function AuthForgotPassword({ setShowOtpModal }: AuthForgotPasswordProps) {
  const emailErrorRef = useRef<HTMLDivElement>(null);
  const email = useSelector((state: RootState) => state.forgotPassword.email);
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
      try {
        const data = await forgotPassword(email);
        if (data.success) {
          setLoading(false);
          setShowOtpModal(true);
        } else {
          toast.error(data?.message || "An error occured. Please try again.");
        }
      } catch (error) {
        console.log(error);
        toast.error((error as Error).message || "API connection error.");
      }
    }
    setLoading(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] p-6 sm:p-8 md:p-10 bg-white dark:bg-gray-900 border-1 border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl mx-4 my-8"
      >
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5 md:gap-2 w-full text-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold dark:text-white">
              Find your account
            </h2>
            <p className="text-gray-500 text-[13px] md:text-sm lg:text-base">
              Please enter your registered email address to search for your account.
            </p>
          </div>
          <div className="w-full mb-1">
            <AuthInput
              label="Email Address"
              placeholder="example@email.com"
              type="text"
              ref={emailRef}
              value={email}
              setChange={setEmail}
            />
            <div ref={emailErrorRef} className="text-red-600 pl-3.5"></div>
          </div>
          <AuthSubmitButton title="Proceed" loading={loading} />
        </form>
      </motion.div>
    </>
  );
}

export default AuthForgotPassword;
