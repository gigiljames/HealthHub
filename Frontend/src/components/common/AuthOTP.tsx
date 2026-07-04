import React, { useEffect, useRef, useState, type ReactElement } from "react";
import { motion } from "framer-motion";
import AuthSubmitButton from "./AuthSubmitButton";

interface AuthOtpProps {
  length: number;
  message: string;
  bg: boolean;
  callback: (otp: string) => Promise<void>;
  resendOtpCallback: () => Promise<void>;
}

function AuthOTP({
  length,
  message,
  bg,
  callback,
  resendOtpCallback,
}: AuthOtpProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [minutes, setMinutes] = useState<number>(1);
  const [seconds, setSeconds] = useState<number>(10);
  const [showResendButton, setshowResendButton] = useState<boolean>(true);
  const otpErrorRef = useRef<HTMLDivElement>(null);
  const InputRefs: React.RefObject<HTMLInputElement | null>[] = [];
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
    await resendOtpCallback();
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
        className="no-spinners h-[45px] md:h-[50px] w-[40px] md:w-[45px] text-center border-1 border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:border-darkGreen dark:focus:border-emerald-500 font-medium text-lg outline-none transition-colors"
        onKeyDown={(e) => handleKeyDown(e, i)}
        maxLength={1}
      />,
    );
    InputRefs.push(inputRef);
  }

  //Handling PASTE
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    let otp = e.clipboardData.getData("text").trim();
    const isValid = /^[0-9]*$/.test(otp);
    if (isValid) {
      otp = otp.substring(0, length);
      for (let i = 0; i < otp.length; i++) {
        const input = InputRefs[i]?.current;
        if (input) {
          input.value = otp[i];
        }
      }
      if (otp.length < length) {
        InputRefs[otp.length]?.current?.focus();
      } else {
        InputRefs[length - 1]?.current?.focus();
      }
    }
  }

  //Handling KEYDOWN
  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
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
      if (inputRef.current) {
        otp += inputRef.current.value;
      }
    }
    // console.log(otp);
    const isValid = /^[0-9]*$/.test(otp) && otp.length === length;
    if (isValid) {
      await callback(otp);
      setLoading(false);
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
            ? `fixed inset-0 flex justify-center items-center bg-black/60 z-51 px-4 transition-opacity`
            : "px-4"
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-900 shadow-sm border-1 border-gray-200 dark:border-gray-800 w-full max-w-[400px] md:max-w-[480px] p-6 sm:p-8 md:p-10 rounded-2xl mx-auto my-auto text-gray-800 dark:text-gray-100 transition-colors"
        >
          <form className="flex flex-col items-center" onSubmit={handleSubmit}>
            <p className="font-bold text-xl md:text-2xl text-center mb-2">
              Enter OTP
            </p>
            <p className="text-center mb-6 font-medium text-gray-500 text-[13px] md:text-sm lg:text-base">
              {message || "Enter the OTP sent to your email."}
            </p>
            <div>
              <div className="flex justify-between gap-2 md:gap-4 ">
                {Inputs.map((val) => val)}
              </div>
              <div
                ref={otpErrorRef}
                className="text-red-500 text-sm text-center mb-2"
              ></div>
              <div className="flex justify-between px-1 font-medium mt-1 mb-2 text-[13px] md:text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  {minutes < 10 ? `0${minutes}` : minutes}:
                  {seconds < 10 ? `0${seconds}` : seconds}
                </p>
                {showResendButton ? (
                  <button
                    className="text-darkGreen hover:underline disabled:text-gray-400 dark:disabled:text-gray-600 outline-none"
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
        </motion.div>
      </div>
    </>
  );
}

export default AuthOTP;
