import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import AuthInput from "./AuthInput";
import AuthSubmitButton from "./AuthSubmitButton";
// ... (rest of imports)
import toast from "react-hot-toast";
import { resetPassword } from "../../api/auth/authService";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  setPassword,
  setRePassword,
} from "../../state/auth/forgotPasswordSlice";
import { useNavigate } from "react-router";

interface AuthChangePasswordProps {
  setStage: React.Dispatch<React.SetStateAction<number>>;
}

function AuthChangePassword({ setStage }: AuthChangePasswordProps) {
  const password = useSelector(
    (state: RootState) => state.forgotPassword.password,
  );
  const rePassword = useSelector(
    (state: RootState) => state.forgotPassword.rePassword,
  );
  const email = useSelector((state: RootState) => state.forgotPassword.email);
  const token = useSelector((state: RootState) => state.forgotPassword.token);
  const passwordRef = useRef(null);
  const rePasswordRef = useRef(null);
  const passwordErrorRef = useRef<HTMLDivElement>(null);
  const rePasswordErrorRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let valid = true;
    if (!password) {
      valid = false;
      showError(passwordErrorRef, "Enter new password");
    } else if (!passwordRegex.test(password)) {
      valid = false;
      showError(passwordErrorRef, "Enter a stronger password.");
      toast.error(
        `The password should contain 
        at least 8 characters, including
        uppercase and lowercase letters,
        numbers, and special characters
        ( !@#$%^&* ).`,
        {
          position: "top-right",
          duration: 5000,
        },
      );
    }
    if (!rePassword) {
      valid = false;
      showError(rePasswordErrorRef, "Re-enter new password");
    } else if (password !== rePassword) {
      valid = false;
      showError(rePasswordErrorRef, "Passwords do not match.");
    }

    if (valid) {
      try {
        const data = await resetPassword(password, email, token);
        if (data.success) {
          toast.success(
            data?.message || "Password reset successful. Login to continue.",
          );
          // setStage(4);
          const role = data?.role;
          navigate(role === "doctor" ? "/doctor/login" : "/login");
        } else {
          toast.error(
            data?.message || "An error occured while changing password.",
          );
        }
      } catch (error) {
        console.log(error);
        toast.error((error as Error).message || "API connection error.");
      }
    }
    setLoading(false);
  };

  function showError(
    ref: React.RefObject<HTMLDivElement | null>,
    message: string,
  ) {
    if (ref.current) ref.current.innerHTML = message;
  }

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
              Change Password
            </h2>
            <p className="text-gray-500 text-[13px] md:text-sm lg:text-base">
              Enter your new desired password below.
            </p>
          </div>
          <div className="w-full flex flex-col mb-2 gap-1.5">
            <AuthInput
              label="New Password"
              placeholder="Min 8 characters"
              type="password"
              ref={passwordRef}
              setChange={setPassword}
              value={password}
            />
            <div
              ref={passwordErrorRef}
              className="text-red-500 text-xs w-full text-left -mt-2.5 mb-1.5 pl-1"
            ></div>
            <AuthInput
              label="Confirm Password"
              placeholder="Re-enter new password"
              type="password"
              ref={rePasswordRef}
              setChange={setRePassword}
              value={rePassword}
            />
            <div
              ref={rePasswordErrorRef}
              className="text-red-500 text-xs w-full text-left -mt-2.5 mb-1.5 pl-1"
            ></div>
          </div>
          <AuthSubmitButton title="Proceed" loading={loading} />
        </form>
      </motion.div>
    </>
  );
}

export default AuthChangePassword;
