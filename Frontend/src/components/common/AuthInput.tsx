// import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import getIcon from "../../helpers/getIcon";

interface AuthInputProps {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  setChange: ActionCreatorWithPayload<string>;
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, placeholder, type, setChange, value }, ref) => {
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="flex flex-col gap-1 md:gap-1.5 w-full mb-2 md:mb-3 text-left">
        <label className="font-medium text-sm md:text-base text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="relative w-full">
          <input
            className={`border-1 border-gray-300 dark:border-gray-600 p-2.5 md:p-3 rounded-md w-full bg-white dark:bg-gray-800 text-sm md:text-base text-gray-800 dark:text-gray-100 h-[45px] md:h-[50px] transition-colors focus:outline-none focus:border-darkGreen dark:focus:border-emerald-500 ${
              type === "password" ? "pr-10" : ""
            }`}
            type={type === "password" && showPassword ? "text" : type || "text"}
            ref={ref}
            value={value}
            onChange={(e) => dispatch(setChange(e.target.value))}
            placeholder={placeholder}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword
                ? getIcon("eye", "1.25rem")
                : getIcon("eye-off", "1.25rem")}
            </button>
          )}
        </div>
      </div>
    );
  },
);

export default AuthInput;
