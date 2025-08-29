import React from "react";
import { MdEdit } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";

interface HDepartmentCardProps {
  title: string | "";
  iconUrl: string | "default_icon.png";
}

function HDepartmentCard({ title, iconUrl }: HDepartmentCardProps) {
  return (
    <>
      <div className="flex justify-between bg-pastelGreen px-4 py-3 rounded-md w-full items-center">
        <div>
          <img src={iconUrl} />
          <p className="font-bold">{title}</p>
        </div>
        <div className="flex gap-2.5 items-center justify-center">
          <span className="hover:scale-110 hover:bg-gray-400 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200">
            <MdEdit size={"20px"} />
          </span>
          <span className="hover:scale-110 hover:bg-red-300 active:scale-75 p-1 rounded-sm cursor-pointer transition-all duration-200">
            <RiDeleteBinFill size={"20px"} />
          </span>
        </div>
      </div>
    </>
  );
}

export default HDepartmentCard;
