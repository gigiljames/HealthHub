import React from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

interface ProfileCreationUploadProps {
  title: string | "Upload documents";
}

function ProfileCreationUpload({ title }: ProfileCreationUploadProps) {
  return (
    <>
      <div className="flex flex-col gap-1.5 w-full">
        <p className="text-[#717171] text-sm font-semibold">{title}</p>
        <div
          className="bg-[#D8D8D8] rounded-md flex flex-col justify-center items-center p-6"
          onClick={() => document.getElementById("reg-cert")?.click()}
        >
          <input type="file" id="reg-cert" className="hidden" />
          <FaCloudUploadAlt size={"120px"} color="#222222" />
          <p className="text-[#8F8F8F] text-sm font-semibold">
            Drag & drop or Click to Browse
          </p>
        </div>
      </div>
    </>
  );
}

export default ProfileCreationUpload;
