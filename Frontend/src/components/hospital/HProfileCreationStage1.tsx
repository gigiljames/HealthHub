import { useState } from "react";
import LoadingCircle from "../common/LoadingCircle";
import ProfileCreationInput from "../common/ProfileCreationInput";
import { saveHospitalProfileStage1 } from "../../api/hospital/hProfileCreationService";
import toast from "react-hot-toast";

interface HProfileCreationStage1Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function HProfileCreationStage1({ changeStage }: HProfileCreationStage1Props) {
  const [loading, setLoading] = useState(false);
  async function handleNextClick() {
    const stage1Data = {};
    // console.log(stage1Data);
    //validation here
    setLoading(true);
    // api service call here
    try {
      const data = await saveHospitalProfileStage1(stage1Data);
      setLoading(false);
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
      <div className="flex flex-col lg:flex-row pt-7">
        <div className="w-full">Profile picture</div>
        <div className="flex flex-col gap-2">
          <ProfileCreationInput
            title="Name of Hospital"
            placeholder="Enter your name"
          />
          <ProfileCreationInput
            title="Registered email"
            disabled={true}
            value="example@gmail.com"
          />
        </div>
      </div>
      <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pb-3 pt-2">
        <ProfileCreationInput title="Type" />
        <ProfileCreationInput title="Established Year" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
          About
        </p>
        <div className="flex flex-col relative w-full mb-1.5 p-1 bg-white rounded-lg border-1 border-inputBorder">
          <textarea className="p-2  peer text-sm md:text-[16px] md:min-w-[200px] lg:min-w-[400px] h-[50px] bg-white min-h-40"></textarea>
        </div>
      </div>
      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className="flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-darkGreen hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]"
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

export default HProfileCreationStage1;
