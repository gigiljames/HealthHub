import React, {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
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
import axios from "../../api/axios";

interface AuthSignupFormProps {
  setIsLogin: Dispatch<SetStateAction<boolean>>;
  setShowOtpModal: Dispatch<SetStateAction<boolean>>;
  role: string;
}

function AuthSignupForm({
  setIsLogin,
  setShowOtpModal,
  role,
}: AuthSignupFormProps) {
  let signupUrl = "";
  switch (role) {
    case "user":
      signupUrl = "signup";
      break;
    case "doctor":
      signupUrl = "doctor/signup";
      break;
    case "hospital":
      signupUrl = "hospital/signup";
      break;
    default:
      break;
  }
  let title = "";
  switch (role) {
    case "doctor":
      title = "Doctor";
      break;
    case "hospital":
      title = "Hospital";
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
  function handleLinkClick() {
    setIsLogin(true);
    const titleBoard = document.querySelector(".title-board");
    if (titleBoard) {
      titleBoard.classList.remove("board-slide-left", "board-slide-right");
      titleBoard.classList.add("board-slide-left");
    }
  }
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // setShowOtpModal(true);
    e.preventDefault();
    removeErrors();
    setLoading(true);
    let valid = true;
    if (!name) {
      valid = false;
      showError(nameErrorRef, "Enter your name.");
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
        }
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
        // await axios.post(signupUrl, {
        //   name: name,
        //   email: email,
        // });
        setShowOtpModal(true);
      } catch (e) {
        console.log(e);
        console.log("Axios Error.");
      }
    }
    setLoading(false);
  }

  function showError(
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
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
      <div className="w-full px-2 sm:px-9 py-2">
        <form
          className="auth-form flex flex-col items-center justify-center w-full"
          onSubmit={(e) => handleSubmit(e)}
        >
          <img
            src="/Logo_with_text_black.png"
            alt="HealthHub logo with text"
            className="mb-4 h-[60px] lg:hidden"
          />
          <h2 className="auth-title mb-5 lg:mb-7 text-3xl md:text-3xl">
            {title} Signup
          </h2>
          <AuthGoogleButton title="Sign up with Google" />
          {/* Line Separation */}
          <div className="h-[30px] w-full flex items-start my-1.5 text-[#dfdfdf]">
            <div className="h-[15px] w-full border-b-1"></div>
            <span className="h-[30px] px-1 flex items-center text-sm">OR</span>
            <div className="h-[15px] w-full border-b-1"></div>
          </div>
          {/* Line Separation */}
          <AuthInput
            placeholder={"Enter your full name"}
            type={"text"}
            ref={nameRef}
            setChange={setName}
          />
          <div className="error-container" ref={nameErrorRef}></div>
          <AuthInput
            placeholder={"Enter your email"}
            type={"text"}
            ref={emailRef}
            setChange={setEmail}
          />
          <div className="error-container" ref={emailErrorRef}></div>
          <AuthInput
            placeholder={"Create a new password"}
            type={"password"}
            ref={passwordRef}
            setChange={setPassword}
          />
          <div className="error-container" ref={passwordErrorRef}></div>
          <AuthInput
            placeholder={"Re-enter new password"}
            type={"password"}
            ref={rePasswordRef}
            setChange={setRePassword}
          />
          <div className="error-container" ref={rePasswordErrorRef}></div>
          <AuthSubmitButton title="Join HealthHub" loading={loading} />
          <div className="flex gap-2 font-medium  mt-6 lg:mb-3 text-sm md:text-[16px]">
            Already have an account?
            <span className="auth-link " onClick={handleLinkClick}>
              Log in
            </span>
          </div>
        </form>
      </div>
    </>
  );
}

export default AuthSignupForm;
