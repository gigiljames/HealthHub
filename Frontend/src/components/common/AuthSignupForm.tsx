import React, {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Link } from "react-router";
import AuthInput from "./AuthInput";
import AuthSubmitButton from "./AuthSubmitButton";
import {
  setName,
  setEmail,
  setPassword,
  setRePassword,
} from "../../state/auth/signupSlice";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import toast from "react-hot-toast";
import AuthGoogleButton from "./AuthGoogleButton";
import { signup } from "../../api/auth/authService";
import { URL } from "../../constants/URLs";

interface AuthSignupFormProps {
  setShowOtpModal: Dispatch<SetStateAction<boolean>>;
  role: string;
}

function AuthSignupForm({ setShowOtpModal, role }: AuthSignupFormProps) {
  let homeUrl = "";
  let profileCreationUrl = "";
  switch (role) {
    case "user":
      homeUrl = "/home";
      profileCreationUrl = URL.user.PROFILE_CREATION;
      break;
    case "doctor":
      homeUrl = "/doctor/home";
      profileCreationUrl = URL.doctor.PROFILE_CREATION;
      break;
    default:
      break;
  }
  const name = useSelector((state: RootState) => state.signup.name);
  const email = useSelector((state: RootState) => state.signup.email);
  const password = useSelector((state: RootState) => state.signup.password);
  const rePassword = useSelector((state: RootState) => state.signup.rePassword);
  const [loading, setLoading] = useState(false);
  const nameErrorRef = useRef<HTMLDivElement>(null);
  const emailErrorRef = useRef<HTMLDivElement>(null);
  const passwordErrorRef = useRef<HTMLDivElement>(null);
  const rePasswordErrorRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const rePasswordRef = useRef<HTMLInputElement>(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  const nameRegex = /^[A-Za-z\s'-]{2,30}$/;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // setShowOtpModal(true);
    e.preventDefault();
    removeErrors();
    setLoading(true);
    let valid = true;
    if (!name) {
      valid = false;
      showError(nameErrorRef, "Enter name.");
    } else if (!nameRegex.test(name)) {
      valid = false;
      showError(nameErrorRef, "Enter a valid name.");
    }
    if (!email) {
      valid = false;
      showError(emailErrorRef, "Enter your email.");
    } else if (!emailRegex.test(email)) {
      valid = false;
      showError(emailErrorRef, "Enter a valid email.");
    }
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
        const data = await signup(name, email, role);
        if (data.success) {
          setShowOtpModal(true);
        } else {
          toast.error(data?.message || "An error occured while signing up");
        }
      } catch (e) {
        console.log(e);
        console.log("Axios Error.");
      }
    }
    setLoading(false);
  }

  function showError(
    ref: React.RefObject<HTMLDivElement | null>,
    message: string,
  ) {
    if (ref.current) ref.current.innerHTML = message;
  }

  function removeErrors() {
    if (nameErrorRef.current) nameErrorRef.current.innerHTML = "";
    if (emailErrorRef.current) emailErrorRef.current.innerHTML = "";
    if (passwordErrorRef.current) passwordErrorRef.current.innerHTML = "";
    if (rePasswordErrorRef.current) rePasswordErrorRef.current.innerHTML = "";
  }

  return (
    <>
      <div className="w-full">
        <form
          className="flex flex-col items-center justify-center w-full"
          onSubmit={(e) => handleSubmit(e)}
        >
          <div className="flex flex-col gap-1.5 md:gap-2 w-full text-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold dark:text-white">
              Create an Account
            </h2>
            <p className="text-gray-500 text-[13px] md:text-sm lg:text-base">
              Join us to{" "}
              {role === "user"
                ? "manage your health and appointments"
                : "grow your practice and consult online"}
            </p>
          </div>
          <AuthGoogleButton
            title="Sign up with Google"
            homeUrl={homeUrl}
            profileCreationUrl={profileCreationUrl}
            role={role}
          />
          {/* Line Separation */}
          <div className="flex items-center gap-4 my-4 md:my-5 w-full text-gray-400">
            <div className="h-[1px] bg-gray-200 dark:bg-gray-700 w-full"></div>
            <span className="text-xs md:text-sm font-medium">OR</span>
            <div className="h-[1px] bg-gray-200 dark:bg-gray-700 w-full"></div>
          </div>
          {/* Line Separation */}
          <AuthInput
            label="Full Name"
            placeholder="Enter full name"
            type="text"
            ref={nameRef}
            setChange={setName}
            value={name}
          />
          <div
            className="text-red-500 text-xs md:text-sm w-full text-left -mt-1.5 mb-1.5 md:-mt-1 md:mb-2"
            ref={nameErrorRef}
          ></div>
          <AuthInput
            label="Email Address"
            placeholder="example@email.com"
            type="text"
            ref={emailRef}
            setChange={setEmail}
            value={email}
          />
          <div
            className="text-red-500 text-xs md:text-sm w-full text-left -mt-1.5 mb-1.5 md:-mt-1 md:mb-2"
            ref={emailErrorRef}
          ></div>
          <AuthInput
            label="Password"
            placeholder="Create a new password"
            type="password"
            ref={passwordRef}
            setChange={setPassword}
            value={password}
          />
          <div
            className="text-red-500 text-xs md:text-sm w-full text-left -mt-1.5 mb-1.5 md:-mt-1 md:mb-2"
            ref={passwordErrorRef}
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
            className="text-red-500 text-xs md:text-sm w-full text-left -mt-1.5 mb-1.5 md:-mt-1 md:mb-2"
            ref={rePasswordErrorRef}
          ></div>
          <AuthSubmitButton title="Join HealthHub" loading={loading} />
          <div className="flex gap-1.5 md:gap-2 font-medium mt-4 md:mt-6 lg:mb-2 text-[13.5px] md:text-sm lg:text-[16px]">
            Already have an account?
            <Link
              to={role === "user" ? "/login" : "/doctor/login"}
              className="text-darkGreen hover:underline font-medium text-[13.5px] md:text-sm lg:text-[16px]"
            >
              Log in
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default AuthSignupForm;
