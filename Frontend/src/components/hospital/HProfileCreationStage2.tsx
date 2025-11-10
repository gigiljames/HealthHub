import { useState } from "react";
import ProfileCreationInput from "../common/ProfileCreationInput";
import LoadingCircle from "../common/LoadingCircle";
import { saveHospitalProfileStage2 } from "../../api/hospital/hProfileCreationService";
import toast from "react-hot-toast";

interface HProfileCreationStage2Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function HProfileCreationStage2({ changeStage }: HProfileCreationStage2Props) {
  const [loading, setLoading] = useState(false);
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    const stage2Data = {};
    // console.log(stage1Data);
    //validation here
    setLoading(true);
    // api service call here
    try {
      const data = await saveHospitalProfileStage2(stage2Data);
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
      <div className="flex flex-col">
        <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pt-7 pb-3">
          <ProfileCreationInput title="Phone" />
          <ProfileCreationInput title="Email" />
          <ProfileCreationInput title="Website" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-1 w-full">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Location
            </p>
            <div className="bg-white w-full h-full"></div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Address
            </p>
            <div className="flex flex-col relative w-full mb-1.5 p-1 bg-white rounded-lg border-1 border-inputBorder">
              <textarea className="p-2  peer text-sm md:text-[16px] md:min-w-[200px] lg:min-w-[400px] h-[50px] bg-white min-h-30"></textarea>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className="flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-inputBorder hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]"
          onClick={handleBackClick}
        >
          Back
        </button>
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

export default HProfileCreationStage2;
