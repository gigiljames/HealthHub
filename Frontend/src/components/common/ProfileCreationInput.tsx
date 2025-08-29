import React from "react";
import getIcon from "../../helpers/getIcon";

interface ProfileCreationInputProps {
  placeholder: string;
  type?: string | "text";
  setChange: (val: any) => void;
  title: string;
  disabled?: boolean;
  value?: string | number;
  select?: boolean | false;
  options?: string[];
  icon?: string | false;
  color?: string;
}

const ProfileCreationInput = React.forwardRef<
  HTMLInputElement,
  ProfileCreationInputProps
>(
  (
    {
      placeholder,
      type,
      title,
      setChange,
      disabled,
      value,
      select,
      options,
      icon,
      color,
    },
    ref
  ) => {
    let boxColor = "bg-white";
    switch (color) {
      case "lightGrey":
        boxColor = "bg-[#f8f8f8]";
        break;
      default:
        break;
    }
    return (
      <>
        <div className="flex flex-col gap-1">
          <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
            {title}
          </p>
          <div className="flex flex-col relative w-full mb-1.5 ">
            {select ? (
              <div
                className={`border-1 border-inputBorder px-3  rounded-lg peer md:min-w-[200px] lg:min-w-[400px]  ${
                  disabled ? "bg-[#DFDFDF] text-[#B2B2B2]" : boxColor
                }   h-[50px]`}
              >
                <select
                  className="w-full h-full capitalize text-sm md:text-[16px]"
                  defaultValue="default"
                  onChange={(e) => setChange(e.target.value)}
                  ref={ref}
                >
                  <option value="default" disabled className="text-[#717171]">
                    {placeholder || "Choose here"}
                  </option>
                  {options &&
                    options.map((option, index) => {
                      return (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      );
                    })}
                </select>
              </div>
            ) : (
              <input
                className={`no-spinners border-1 border-inputBorder p-3 rounded-lg peer text-sm md:text-[16px] md:min-w-[200px] lg:min-w-[400px] ${
                  disabled ? "bg-[#DFDFDF] text-[#B2B2B2]" : boxColor
                }   h-[50px]`}
                type={type || "text"}
                ref={ref}
                onChange={(e) => setChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                value={value}
              />
            )}
            {icon && <span>{getIcon(icon, "20px", "#ffffff")}</span>}
          </div>
        </div>
      </>
    );
  }
);

export default ProfileCreationInput;
