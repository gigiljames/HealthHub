import toast from "react-hot-toast";
import LoadingCircle from "../common/LoadingCircle";
import { useState } from "react";
import { useNavigate } from "react-router";

interface DProfileCreationStage5Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function DProfileCreationStage5({ changeStage }: DProfileCreationStage5Props) {
  const [loading, setLoading] = useState(false);
  const name = "Arnold Mathews";
  const navigate = useNavigate();
  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }
  async function handleNextClick() {
    // const stage4Data = {
    //   userId: userInfo.id,
    //   surgeries,
    // };
    // console.log(surgeries);
    setLoading(true);
    // api service call here
    setLoading(false);
    try {
      // const data = await saveUserProfileStage4(stage4Data);
      // setLoading(false);
      // if (data.success) {
      //   toast.success(data?.message || "Saved successfully.");
      // } else {
      //   throw new Error("An error occured while saving profile.");
      // }
      // dispatch(setIsNewUser(false));
      navigate("/doctor/home");
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occured while saving profile."
      );
    }
  }
  return (
    <>
      <div className="bg-white p-5 rounded-lg mt-4 font-medium mb-2">
        <p>
          I, Dr. {name}, hereby declare that all the information I have provided
          is true and accurate to the best of my knowledge.
        </p>
        <p>I acknowledge and agree that:</p>
        <ul className="list-disc px-6">
          <li>
            I am a licensed and registered medical professional qualified to
            provide medical consultations and issue prescriptions.
          </li>
          <li>
            I understand that all medical information available through
            HealthHub is confidential and will be used solely for diagnosis,
            treatment, or care coordination.
          </li>
          <li>
            I will not share or misuse patient data in any form, and will comply
            with all relevant data protection laws and ethical standards.
          </li>
          <li>
            I accept that unauthorized access, data tampering, or violation of
            any patient’s privacy may result in permanent suspension from the
            platform and legal action as per applicable laws.
          </li>
          <li>
            I will maintain a professional and respectful interaction with all
            patients and colleagues on the platform.
          </li>
        </ul>
        <p>
          By proceeding, I accept the terms and conditions and affirm my
          responsibility as a healthcare provider using the HealthHub system.
        </p>
        <div className="flex gap-4 mt-3">
          <input type="checkbox" className="scale-125" />
          <span className="font-bold">
            I Accept and Agree to the above declaration.
          </span>
        </div>
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
            "Get started"
          )}
        </button>
      </div>
    </>
  );
}

export default DProfileCreationStage5;
