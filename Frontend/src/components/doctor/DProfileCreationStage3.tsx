import { MdEdit } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";
import { useDoctorProfileCreationStore } from "../../zustand/doctoreStore";
import LoadingCircle from "../common/LoadingCircle";
import { useState } from "react";
import toast from "react-hot-toast";

interface DProfileCreationStage3Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function DProfileCreationStage3({ changeStage }: DProfileCreationStage3Props) {
  const [loading, setLoading] = useState(false);
  const toggleModal = useDoctorProfileCreationStore(
    (state) => state.toggleExperienceModal
  );
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    // validation here
    // const stage2Data = {
    //   userId: userInfo.id,
    //   height,
    //   weight,
    //   address,
    //   phoneNumber,
    // };
    // console.log(data);
    setLoading(true);
    // api service call here
    try {
      // const data = await saveUserProfileStage2(stage2Data);
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
      <div className="bg-white rounded-lg mt-3 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg font-bold">Add Experience</p>
          <button
            className="bg-pastelBlue font-bold px-5 py-2 rounded-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            onClick={() => toggleModal()}
          >
            Add new
          </button>
        </div>
        <hr className="border-[1.5px] border-[#dddddd]" />
        <div className="flex py-2 justify-between">
          <div>
            <p className="font-bold">Kottayam Medical College</p>
            <p className="font-medium">Consultant Cardiologist - Full-time</p>
            <p className="font-medium text-inputBorder">
              Number of years - 4 mo. ( July 2025 - present )
            </p>
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
        <hr className="border-[1.5px] border-[#dddddd]" />
      </div>

      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className={`flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-inputBorder hover:-translate-y-0.5 transition-all duration-200 cursor-pointer  h-[50px]`}
          onClick={handleBackClick}
        >
          Back
        </button>
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

export default DProfileCreationStage3;
