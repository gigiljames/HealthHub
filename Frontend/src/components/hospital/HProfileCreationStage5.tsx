import { useState } from "react";
import { saveHospitalProfileStage5 } from "../../api/hospital/hProfileCreationService";
import toast from "react-hot-toast";
import LoadingCircle from "../common/LoadingCircle";

interface HProfileCreationStage5Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function HProfileCreationStage5({ changeStage }: HProfileCreationStage5Props) {
  const [loading, setLoading] = useState(false);
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    const stage3Data = {};
    // console.log(stage1Data);
    //validation here
    setLoading(true);
    // api service call here
    try {
      const data = await saveHospitalProfileStage5(stage3Data);
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
      Declaration
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
            "Get Started"
          )}
        </button>
      </div>
    </>
  );
}

export default HProfileCreationStage5;
