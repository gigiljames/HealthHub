import React from "react";

interface AuthInputProps {
  placeholder: string;
  type: string;
  setChange: (val: string) => void;
}

const DoctorNameInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ placeholder, type, setChange }, ref) => {
    return (
      <>
        <div className="flex flex-col relative w-full mb-1.5">
          <input
            className="border-1 border-inputBorder pl-10 p-3  rounded-xl peer w-full bg-white h-[50px]"
            type={type || "text"}
            ref={ref}
            onChange={(e) => setChange(e.target.value)}
            placeholder=""
          />
          <span className="absolute w-[35px] h-full rounded-l-xl bg-darkGreen text-white flex justify-center items-center font-semibold">
            <span>Dr.</span>
          </span>
          <span className="absolute left-10 top-3.5 px-1 text-inputPlaceholder peer-focus:-translate-y-5.5 -translate-y-5.5 peer-placeholder-shown:-translate-y-0 bg-white transition-tranform duration-100 ease-out peer-focus:text-sm peer-placeholder-shown:text-[16px] align-top text-sm rounded-md">
            {placeholder || "Placeholder"}
          </span>
        </div>
      </>
    );
  }
);

export default DoctorNameInput;
