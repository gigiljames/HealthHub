import React, {
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
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

interface AuthLoginFormProps {
  setIsLogin: Dispatch<SetStateAction<boolean>>;
  role: string;
}

function AuthLoginForm({ setIsLogin, role }: AuthLoginFormProps) {
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
    case "hospital":
      forgotPasswordUrl = "/hospital/forgot-password";
      homeUrl = "/hospital/home";
      profileCreationUrl = URL.hospital.PROFILE_CREATION;
      title = "Hospital";
      break;
    default:
      break;
  }

  function handleLinkClick() {
    setIsLogin(false);
    const titleBoard = document.querySelector(".title-board");
    if (titleBoard) {
      titleBoard.classList.remove("board-slide-left", "board-slide-right");
      titleBoard.classList.add("board-slide-right");
    }
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
          })
        );
        // save accesstoken logic here
        dispatch(
          addToken({ token: data.accessToken, role: data.userInfo?.role })
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
            {title} Log In
          </h2>
          <AuthGoogleButton
            title="Log in with Google"
            homeUrl={homeUrl}
            profileCreationUrl={profileCreationUrl}
            role={role}
          />

          {/* Line Separation */}
          <div className="h-[30px] w-full flex items-start my-1.5 text-[#dfdfdf]">
            <div className="h-[15px] w-full border-b-1"></div>
            <span className="h-[30px] px-1 flex items-center text-sm">OR</span>
            <div className="h-[15px] w-full border-b-1"></div>
          </div>
          {/* Line Separation */}
          <AuthInput
            placeholder={"Email"}
            type={"text"}
            ref={emailRef}
            setChange={setEmail}
            value={email}
          />
          <div className="error-container" ref={emailErrorRef}></div>
          <AuthInput
            placeholder={"Password"}
            type={"password"}
            ref={passwordRef}
            setChange={setPassword}
            value={password}
          />
          <div className="error-container" ref={passwordErrorRef}></div>
          <AuthSubmitButton title="Log in" loading={loading} />
          <div className="flex gap-2 mt-6 mb-2.5 font-medium text-sm md:text-[16px]">
            Doesn't have an account?
            <span className="auth-link" onClick={handleLinkClick}>
              Sign up
            </span>
          </div>
          <Link to={forgotPasswordUrl}>
            <span className="underline font-medium text-darkGreen text-sm md:text-[16px]">
              Forgot Password?
            </span>
          </Link>
        </form>
      </div>
    </>
  );
}

export default AuthLoginForm;
