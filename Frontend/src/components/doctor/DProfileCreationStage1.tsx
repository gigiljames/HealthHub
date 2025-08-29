import React from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";

function DProfileCreationStage1() {
  return (
    <>
      <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-7 pb-3 ">
        <ProfileCreationInput title="Name" placeholder="Enter your name" />
        <ProfileCreationInput
          title="Registered email"
          disabled={true}
          value="example@gmail.com"
        />
        <ProfileCreationInput title="Specialization" />
        <ProfileCreationInput title="Gender" />
        <ProfileCreationInput title="Date of birth" />
        <ProfileCreationInput title="Location (Independent consultation)" />
        <ProfileCreationInput title="Phone number" />
      </div>
    </>
  );
}

export default DProfileCreationStage1;
