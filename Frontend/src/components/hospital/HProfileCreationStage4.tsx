import { useState } from "react";
import toast from "react-hot-toast";
import LoadingCircle from "../common/LoadingCircle";
import { MdAddBox } from "react-icons/md";
import HFeatureCard from "./HFeatureCard";
import { saveHospitalProfileStage4 } from "../../api/hospital/hProfileCreationService";

interface HProfileCreationStage3Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function HProfileCreationStage4({ changeStage }: HProfileCreationStage3Props) {
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
      const data = await saveHospitalProfileStage4(stage2Data);
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
      <div className="bg-darkGreen rounded-lg mt-5 p-3">
        <p className="font-bold text-white mb-1.5">Add Features</p>
        <div className="flex flex-col md:flex-row gap-3 mb-2.5">
          <input
            type="text"
            placeholder="Enter feature"
            className="border-1 border-inputBorder p-3 rounded-lg peer md:min-w-[200px] lg:min-w-[300px] bg-white h-[45px]"
          />

          <button className="rounded-lg px-6 bg-lightBlue flex justify-center items-center gap-2 h-[45px] hover:-translate-y-0.5 transition-all duration-200">
            <span className="font-bold">Add</span>
            <span>
              <MdAddBox size={"25px"} />
            </span>
          </button>
        </div>
        <div className="bg-white rounded-lg p-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-2">
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
          <HFeatureCard title="Parking" />
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

export default HProfileCreationStage4;
