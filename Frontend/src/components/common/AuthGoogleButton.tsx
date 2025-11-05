import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { googleAuth } from "../../api/auth/authService";
import { useDispatch } from "react-redux";
import { addToken } from "../../state/auth/tokenSlice";
import { useRef } from "react";
import { setUserInfo } from "../../state/auth/userInfoSlice";

interface AuthGoogleButtonProps {
  title: string;
  homeUrl: string;
  profileCreationUrl: string;
  role: string;
}

function AuthGoogleButton({ title, role }: AuthGoogleButtonProps) {
  const dispatch = useDispatch();
  const googleButtonRef = useRef<HTMLSpanElement | null>(null);
  async function googleAuthSuccessCallback(
    credentialResponse: CredentialResponse
  ) {
    try {
      const jwtToken = credentialResponse.credential;
      if (!jwtToken) {
        throw new Error("Google authentication failed - no token");
      } else {
        const data = await googleAuth(jwtToken, role);
        console.log(data);
        if (data.success) {
          toast.success(data?.message || "Logged in successfully.");
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
          dispatch(
            addToken({
              token: data.accessToken,
              role: data.userInfo?.role,
            })
          );
        } else {
          throw new Error(data?.message || "Google authentication error.");
        }
      }
    } catch (error) {
      toast.error((error as Error)?.message || "Google authentication error.");
    }
  }

  function handleClick() {
    if (googleButtonRef.current) {
      const button = googleButtonRef.current.querySelector("div[role=button]");
      if (button) (button as HTMLElement).click();
    }
  }
  return (
    <>
      <div
        className="w-full p-3 border-1 border-black rounded-xl flex justify-around items-center h-[50px] cursor-pointer hover:bg-slate-100 active:scale-98 transition-all duration-200"
        onClick={handleClick}
      >
        <div className="flex items-center gap-2 font-semibold text-sm md:text-[16px]">
          <FcGoogle size={28} />
          {title || ""}
          <span className="hidden" ref={googleButtonRef}>
            <GoogleLogin
              logo_alignment="center"
              onSuccess={googleAuthSuccessCallback}
              onError={() => {
                toast.error("Google authentication failed.");
              }}
            />
          </span>
        </div>
      </div>
    </>
  );
}

export default AuthGoogleButton;

// import type { Config } from "tailwindcss";

// const config: Config = {
//   content: [],
//   theme: {
//     extend: {
//       colors: {
//         lightGreen: "rgba(var(--lightGreen))",
//       },
//     },
//   },
// };

// export default config;
