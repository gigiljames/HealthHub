import React from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";

function HProfileCreationStage1() {
  return (
    <>
      <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-7 pb-3 ">
        <ProfileCreationInput title="Name" placeholder="Enter your name" />
        <ProfileCreationInput
          title="Registered email"
          disabled={true}
          value="example@gmail.com"
        />
        <ProfileCreationInput title="Type" />
      </div>
      <div className="flex flex-col">
        <p className="font-semibold text-sm">Contact Information</p>
        <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-2 pb-3">
          <ProfileCreationInput title="Location" />
          <ProfileCreationInput title="Phone" />
          <ProfileCreationInput title="Email" />
          <ProfileCreationInput title="Website" />
        </div>
      </div>
    </>
  );
}

export default HProfileCreationStage1;
