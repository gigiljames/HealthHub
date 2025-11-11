import { useState } from "react";
import { saveHospitalProfileStage3 } from "../../api/hospital/hProfileCreationService";
import toast from "react-hot-toast";
import LoadingCircle from "../common/LoadingCircle";
import ProfileCreationUpload from "../common/ProfileCreationUpload";
import type { RootState } from "../../state/store";
import { useSelector } from "react-redux";

interface HProfileCreationStage3Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function HProfileCreationStage3({ changeStage }: HProfileCreationStage3Props) {
  const [loading, setLoading] = useState(false);
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const gstCertificate = useSelector(
    (state: RootState) => state.hProfileCreation.gstCertificate
  );
  const hospitalRegistration = useSelector(
    (state: RootState) => state.hProfileCreation.hospitalRegistration
  );
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    const stage3Data = {
      hospitalId: userInfo.id,
      gstCertificate,
      hospitalRegistration,
    };
    //validation here
    setLoading(true);
    try {
      const data = await saveHospitalProfileStage3(stage3Data);
      setLoading(false);
      if (data.success) {
        toast.success(data?.message || "Saved successfully.");
      } else {
        throw new Error("An error occured while saving profile.");
      }
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
        <ProfileCreationUpload title="Upload hospital registration certificate" />
        <ProfileCreationUpload title="Upload GST certificate" />
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

export default HProfileCreationStage3;
