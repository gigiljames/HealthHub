import LoadingCircle from "../common/LoadingCircle";
import toast from "react-hot-toast";
import { useState } from "react";
import ProfileCreationUpload from "../common/ProfileCreationUpload";

interface DProfileCreationStage4Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function DProfileCreationStage4({ changeStage }: DProfileCreationStage4Props) {
  const [loading, setLoading] = useState(false);

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
      <div className="flex flex-col md:flex-row w-full gap-3 mt-6 mb-3">
        <ProfileCreationUpload title="Upload your medical license" />
        <ProfileCreationUpload title="Upload your latest degree certificate" />
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

export default DProfileCreationStage4;
