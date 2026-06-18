import React, { useRef, useState, type RefObject } from "react";
import AuthInput from "./AuthInput";
import AuthSubmitButton from "./AuthSubmitButton";
import { Link } from "react-router";
import AuthGoogleButton from "./AuthGoogleButton";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { setEmail, setPassword } from "../../state/auth/loginSlice";
import { addToken } from "../../state/auth/tokenSlice";
import { login } from "../../api/auth/authService";
import { URL } from "../../constants/URLs";
import { setUserInfo } from "../../state/auth/userInfoSlice";
import { Roles } from "../../enums/roles";

interface AuthLoginFormProps {
  role: string;
}

function AuthLoginForm({ role }: AuthLoginFormProps) {
  const dispatch = useDispatch();
  let title = "";
  let forgotPasswordUrl = "";
  let homeUrl = "";
  let profileCreationUrl = "";
  switch (role) {
    case "user":
      forgotPasswordUrl = "/forgot-password";
      homeUrl = "/home";
      profileCreationUrl = URL.user.PROFILE_CREATION;
      break;
    case "doctor":
      forgotPasswordUrl = "/doctor/forgot-password";
      homeUrl = "/doctor/home";
      profileCreationUrl = URL.doctor.PROFILE_CREATION;
      title = "Doctor";
      break;
    default:
      break;
  }

  const email = useSelector((state: RootState) => state.login.email);
  const password = useSelector((state: RootState) => state.login.password);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);
  const emailRef = useRef(null);
  const passwordErrorRef = useRef<HTMLDivElement>(null);
  const emailErrorRef = useRef<HTMLDivElement>(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // const navigate = useNavigate();
  // const dispatch = useDispatch();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    removeErrors();
    setLoading(true);
    let validForm = true;
    if (emailErrorRef.current) {
      emailErrorRef.current.innerText = "";
    }
    if (!email) {
      showError(emailErrorRef, "Enter your email.");
      validForm = false;
    } else if (!emailRegex.test(email)) {
      showError(emailErrorRef, "Enter a valid email.");
      validForm = false;
    }
    if (!password) {
      showError(passwordErrorRef, "Enter your password.");
      validForm = false;
    }
    if (validForm) {
      const data = await login(email, password, role);
      console.log(data);
      if (data.success) {
        toast.success(data?.message || "Logged in successfully");
        // save userinfo logic here
        const userInfo = data?.userInfo;
        dispatch(
          setUserInfo({
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            role: userInfo.role,
            isNewUser: userInfo.isNewUser,
            onboardingStep: userInfo.onboardingStep,
            authType: userInfo.authType,
          }),
        );
        // save accesstoken logic here
        dispatch(
          addToken({ token: data.accessToken, role: data.userInfo?.role }),
        );
        // if (data.userInfo?.isNewUser) {
        //   navigate(profileCreationUrl);
        // } else {
        //   navigate(homeUrl);
        // }
      } else {
        toast.error(data?.message || "An error occcured while loggin in");
      }
    }
    setLoading(false);
  };

  function removeErrors() {
    if (emailErrorRef.current) emailErrorRef.current.innerText = "";
    if (passwordErrorRef.current) passwordErrorRef.current.innerText = "";
  }

  function showError(ref: RefObject<HTMLDivElement | null>, message: string) {
    if (ref.current) {
      ref.current.innerText = message;
    }
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
              Welcome Back{role === Roles.DOCTOR ? ", Doctor" : ""}
            </h2>
            <p className="text-gray-500 text-[13px] md:text-sm lg:text-base">
              Enter your credentials to access your account
            </p>
          </div>
          <AuthGoogleButton
            title="Log in with Google"
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
            label="Email Address"
            placeholder="Enter your email"
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
            placeholder="Enter your password"
            type="password"
            ref={passwordRef}
            setChange={setPassword}
            value={password}
          />
          <div
            className="text-red-500 text-xs md:text-sm w-full text-left -mt-1.5 mb-1.5 md:-mt-1 md:mb-2"
            ref={passwordErrorRef}
          ></div>
          <AuthSubmitButton title="Log in" loading={loading} />
          <div className="flex gap-1.5 md:gap-2 mt-4 md:mt-6 lg:mb-2 font-medium text-[13.5px] md:text-sm lg:text-[16px]">
            Doesn't have an account?
            <Link
              to={role === "user" ? "/signup" : "/doctor/signup"}
              className="text-darkGreen hover:underline font-medium text-[13.5px] md:text-sm lg:text-[16px]"
            >
              Sign up
            </Link>
          </div>
          <Link to={forgotPasswordUrl} className="mt-1 md:mt-2">
            <span className="text-darkGreen hover:underline font-medium text-[13.5px] md:text-sm lg:text-[16px]">
              Forgot Password?
            </span>
          </Link>
        </form>
      </div>
    </>
  );
}

export default AuthLoginForm;
