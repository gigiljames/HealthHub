import React from "react";
import ProfileCreationUpload from "../common/ProfileCreationUpload";

function HProfileCreationStage4() {
  return (
    <>
      <div className="flex flex-col md:flex-row w-full gap-3 mt-6 mb-3">
        <ProfileCreationUpload title="Upload hospital registration certificate" />
        <ProfileCreationUpload title="Upload GST certificate" />
      </div>
    </>
  );
}

export default HProfileCreationStage4;
