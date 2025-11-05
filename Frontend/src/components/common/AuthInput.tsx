// import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import React from "react";
import { useDispatch } from "react-redux";

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
    return (
      <>
        <div className="flex flex-col relative w-full mb-1.5">
          <input
            className="border-1 border-inputBorder p-3 rounded-xl peer w-full bg-white h-[50px]"
            type={type || "text"}
            ref={ref}
            value={value}
            // onChange={(e) => setChange(e.target.value)}
            onChange={(e) => dispatch(setChange(e.target.value))}
            placeholder=""
          />
          <span className="absolute left-2.5 top-3.5 px-1 text-inputPlaceholder peer-focus:-translate-y-5.5 -translate-y-5.5 peer-placeholder-shown:-translate-y-0 bg-white transition-tranform duration-100 ease-out md:peer-placeholder-shown:text-[16px] md:peer-focus:text-sm peer-focus:text-[12px] peer-placeholder-shown:text-sm align-top text-sm rounded-md">
            {placeholder || "Placeholder"}
          </span>
        </div>
      </>
    );
  }
);

export default AuthInput;
