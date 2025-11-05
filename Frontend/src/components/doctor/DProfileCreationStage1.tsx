import React, { useState } from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import LoadingCircle from "../common/LoadingCircle";
import toast from "react-hot-toast";

interface DProfileCreationStage1Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function DProfileCreationStage1({ changeStage }: DProfileCreationStage1Props) {
  const [loading, setLoading] = useState(false);

  async function handleNextClick() {
    // const stage1Data = {
    //   userId: userInfo.id,
    //   name,
    //   maritalStatus,
    //   gender,
    //   dob,
    //   bloodGroup,
    //   allergies,
    //   occupation,
    // };
    //validation here
    setLoading(true);
    // api service call here
    try {
      // const data = await saveUserProfileStage1(stage1Data);
      // setLoading(false);
      // if (data.success) {
      //   toast.success(data?.message || "Saved successfully.");
      // } else {
      //   throw new Error("An error occured while saving profile.");
      // }
      changeStage((prev) => {
        return prev + 1;
      });
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occured while saving profile."
      );
    }
  }

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
      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className={`flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-darkGreen hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]`}
          onClick={handleNextClick}
        >
          {loading ? (
            <>
              <LoadingCircle />
              Loading...
            </>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </>
  );
}

export default DProfileCreationStage1;
