import React, { useEffect, useRef, useState, type ReactElement } from "react";
import AuthSubmitButton from "./AuthSubmitButton";
// import toast from "react-hot-toast";
import axios from "../../api/axios.ts";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store.ts";

interface AuthOtpProps {
  length: number;
  message: string;
  bg: boolean;
  name?: string | "";
  callback: (email: string) => Promise<void>;
}

function AuthOTP({ length, message, bg, name, callback }: AuthOtpProps) {
  // const name = useSelector((state: RootState) => state.signup.name);
  const email = useSelector((state: RootState) => state.signup.email);
  const [loading, setLoading] = useState<boolean>(false);
  const [minutes, setMinutes] = useState<number>(1);
  const [seconds, setSeconds] = useState<number>(10);
  const [showResendButton, setshowResendButton] = useState<boolean>(true);
  const otpErrorRef = useRef<HTMLDivElement>(null);
  const InputRefs: React.RefObject<HTMLInputElement>[] = [];
  const Inputs: ReactElement<HTMLInputElement>[] = [];

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [seconds, minutes]);

  async function resendOtp() {
    setshowResendButton(false);
    await axios.post("/resend-otp", { name, email });
    setshowResendButton(true);
    setMinutes(1);
    setSeconds(59);
  }

  //Creating refs for each OTP input.
  for (let i = 0; i < length; i++) {
    const inputRef = useRef<HTMLInputElement>(null);
    Inputs.push(
      <input
        ref={inputRef}
        key={i}
        type="number"
        onPaste={i === 0 ? (e) => handlePaste(e) : () => {}}
        className="no-spinners h-[50px] md:h-[60px] w-[40px] md:w-[50px] text-center border-1 border-inputBorder rounded-lg mb-3 bg-inputBg"
        onKeyDown={(e) => handleKeyDown(e, i)}
        maxLength={1}
      />
    );
    InputRefs.push(inputRef);
  }

  //Focusing first input immediately after rendering.
  // useEffect(() => {
  //   InputRefs[0].current.focus();
  // });

  //Handling PASTE
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const otp = e.clipboardData.getData("text").trim();
    const isValid = /^[0-9]*$/.test(otp);
    if (isValid && otp.length <= length) {
      {
        for (let i = 0; i < otp.length; i++) {
          InputRefs[i].current.value = otp[i];
        }
      }
    }
  }

  //Handling KEYDOWN
  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) {
    const key = e.key;
    const isDigit = /^[0-9]$/.test(key);
    const currentRef = InputRefs[index].current;
    const nextRef = InputRefs[index + 1]?.current;
    const prevRef = InputRefs[index - 1]?.current;
    if (!currentRef) return;
    if (isDigit) {
      e.preventDefault();
      currentRef.value = key;
      nextRef?.focus();
    } else if (key === "Backspace") {
      if (currentRef.value === "") {
        prevRef?.focus();
      } else {
        currentRef.value = "";
      }
    }
  }

  //Handling SUBMIT
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    let otp = "";
    for (const inputRef of InputRefs) {
      otp += inputRef.current.value;
    }
    console.log(otp);
    const isValid = /^[0-9]*$/.test(otp) && otp.length === length;
    if (isValid) {
      // Check-OTP logic here
      setLoading(false);
      await callback(name, email);
      //click login button here
    } else {
      setLoading(false);
      if (otpErrorRef.current) {
        otpErrorRef.current.innerText = "Please enter a valid OTP.";
      }
    }
  }

  return (
    <>
      <div
        className={
          bg
            ? `absolute h-[100vh] w-[100vw] flex justify-center items-center bg-black/50 z-50 px-3`
            : "px-3"
        }
      >
        <div className="bg-white shadow-[0_0_10px_rgba(0,0,0,0.15)] w-fit p-9 rounded-2xl">
          <form className="flex flex-col items-center" onSubmit={handleSubmit}>
            <p className="font-bold text-3xl md:text-4xl text-center mb-4">
              Enter OTP
            </p>
            <p className="text-center mb-3 font-medium max-w-[300px] md:w-[400px] text-sm md:text-[16px]">
              {message || "Enter the OTP sent to your email."}
            </p>
            <div>
              <div className="flex justify-between gap-2 md:gap-4 ">
                {Inputs.map((val) => val)}
              </div>
              <div ref={otpErrorRef} className="text-red-600 text-center"></div>
              <div className="flex justify-between px-1 font-medium mt-0.5 mb-1 text-sm md:text-[16px]">
                <p>
                  {minutes < 10 ? `0${minutes}` : minutes}:
                  {seconds < 10 ? `0${seconds}` : seconds}
                </p>
                {showResendButton ? (
                  <button
                    className="underline text-darkGreen disabled:text-inputBorder text-sm md:text-[16px]"
                    type="button"
                    disabled={!(minutes === 0 && seconds === 0)}
                    onClick={() => resendOtp()}
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span>Sending OTP...</span>
                )}
              </div>
            </div>
            <AuthSubmitButton title="Confirm" loading={loading} />
          </form>
        </div>
      </div>
    </>
  );
}

export default AuthOTP;
