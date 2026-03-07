// import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import getIcon from "../../helpers/getIcon";

interface AuthInputProps {
  placeholder: string;
  type: string;
  value: string;
  setChange: ActionCreatorWithPayload<string>;
  // setChange;
}

const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ placeholder, type, setChange, value }, ref) => {
    const dispatch = useDispatch();
    const [showPassword, setShowPassword] = useState(false);

    return (
      <>
        <div className="flex flex-col relative w-full mb-1.5">
          <input
            className={`border-1 border-inputBorder p-3 rounded-xl peer w-full bg-white h-[50px] ${type === "password" ? "pr-10" : ""}`}
            type={type === "password" && showPassword ? "text" : type || "text"}
            ref={ref}
            value={value}
            // onChange={(e) => setChange(e.target.value)}
            onChange={(e) => dispatch(setChange(e.target.value))}
            placeholder=""
          />
          <span className="absolute left-2.5 top-3.5 px-1 text-inputPlaceholder peer-focus:-translate-y-5.5 -translate-y-5.5 peer-placeholder-shown:-translate-y-0 bg-white transition-transform duration-100 ease-out md:peer-placeholder-shown:text-[16px] md:peer-focus:text-sm peer-focus:text-[12px] peer-placeholder-shown:text-sm align-top text-sm rounded-md pointer-events-none">
            {placeholder || "Placeholder"}
          </span>
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
      </>
    );
  },
);

export default AuthInput;
