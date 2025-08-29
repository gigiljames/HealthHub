import React, { useRef, useState } from "react";
import AuthInput from "./AuthInput";
import AuthSubmitButton from "./AuthSubmitButton";
import toast from "react-hot-toast";

interface AuthChangePasswordProps {
  setStage: React.Dispatch<React.SetStateAction<number>>;
}

function AuthChangePassword({ setStage }: AuthChangePasswordProps) {
  const [password, setPassword] = useState<string>("");
  const [rePassword, setRePassword] = useState<string>("");
  const passwordRef = useRef(null);
  const rePasswordRef = useRef(null);
  const passwordErrorRef = useRef<HTMLDivElement>(null);
  const rePasswordErrorRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
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
      toast.success("Password reset successful. Login to continue.");
      setStage(4);
    }
    setLoading(false);
  };

  function showError(
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
  ) {
    if (ref.current) ref.current.innerHTML = message;
  }

  return (
    <>
      <div className="w-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.15)] p-9 rounded-2xl max-w-[400px]">
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <img
            src="/Logo_with_text_black.png"
            alt="HealthHub logo with text"
            className="mb-4 h-[60px]"
          />
          <p className="font-semibold text-2xl md:text-3xl text-center mb-4 ">
            Change Password
          </p>
          <div className="w-full flex flex-col mb-2 gap-1.5">
            <div className="flex flex-col justify-center">
              <AuthInput
                placeholder="Create new password"
                type="password"
                ref={passwordRef}
                setChange={setPassword}
              />
              <div
                ref={passwordErrorRef}
                className="text-red-600 text-sm pl-3.5"
              ></div>
            </div>
            <div className="flex flex-col justify-center">
              <AuthInput
                placeholder="Re-enter new password"
                type="password"
                ref={rePasswordRef}
                setChange={setRePassword}
              />
              <div
                ref={rePasswordErrorRef}
                className="text-red-600 text-sm pl-3.5"
              ></div>
            </div>
          </div>
          <AuthSubmitButton title="Proceed" loading={loading} />
        </form>
      </div>
    </>
  );
}

export default AuthChangePassword;
