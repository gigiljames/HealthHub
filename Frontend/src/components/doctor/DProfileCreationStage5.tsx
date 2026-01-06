import toast from "react-hot-toast";
import LoadingCircle from "../common/LoadingCircle";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { saveDoctorProfileStage5 } from "../../api/doctor/dProfileCreationService";
import { setIsNewUser } from "../../state/auth/userInfoSlice";

interface DProfileCreationStage5Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function DProfileCreationStage5({ changeStage }: DProfileCreationStage5Props) {
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleBackClick() {
    changeStage((prev) => {
      return prev - 1;
    });
  }

  async function handleNextClick() {
    if (!acceptedTerms) {
      toast.error("Please accept the declaration and terms.");
      return;
    }

    const stage5Data = {
      userId: userInfo.id,
      acceptedTerms,
      submissionDate: new Date().toISOString(),
    };

    setLoading(true);
    try {
      const data = await saveDoctorProfileStage5(stage5Data);
      setLoading(false);
      if (data?.success) {
        toast.success(data?.message || "Saved successfully.");
        dispatch(setIsNewUser(false));
        navigate("/doctor/home");
      } else {
        throw new Error("An error occurred while saving profile.");
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        (error as Error)?.message || "An error occurred while saving profile."
      );
    }
  }

  return (
    <>
      <div className="bg-white p-5 rounded-lg mt-4 font-medium mb-2">
        <p>
          I, <span className="font-bold">Dr. {userInfo.name}</span>, hereby
          declare that all the information I have provided is true and accurate
          to the best of my knowledge.
        </p>
        <p className="mt-2">I acknowledge and agree that:</p>
        <ul className="list-disc px-6 mt-1 space-y-1">
          <li>
            I am a{" "}
            <span className="font-bold">
              licensed and registered medical professional
            </span>{" "}
            qualified to provide medical consultations and issue prescriptions.
          </li>
          <li>
            I understand that all medical information available through
            HealthHub is <span className="font-bold">confidential</span> and
            will be used solely for diagnosis, treatment, or care coordination.
          </li>
          <li>
            I will not share or misuse patient data in any form, and will comply
            with all relevant{" "}
            <span className="font-bold">data protection laws</span> and ethical
            standards.
          </li>
          <li>
            I accept that unauthorized access, data tampering, or violation of
            any patient’s privacy may result in{" "}
            <span className="font-bold">permanent suspension</span> from the
            platform and legal action as per applicable laws.
          </li>
          <li>
            I will maintain a{" "}
            <span className="font-bold">
              professional and respectful interaction
            </span>{" "}
            with all patients and colleagues on the platform.
          </li>
        </ul>
        <p className="mt-3">
          By proceeding, I accept the{" "}
          <span className="font-bold">terms and conditions</span> and affirm my
          responsibility as a healthcare provider using the HealthHub system.
        </p>
        <div className="flex gap-4 mt-4 items-center">
          <input
            type="checkbox"
            className="scale-125 cursor-pointer accent-darkGreen"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            id="acceptTerms"
          />
          <label
            htmlFor="acceptTerms"
            className="font-bold cursor-pointer select-none"
          >
            I Accept and Agree to the above declaration.
          </label>
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
          className={`flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl ${acceptedTerms ? "bg-darkGreen hover:-translate-y-0.5" : "bg-gray-400 cursor-not-allowed"} transition-all duration-200 cursor-pointer  h-[50px]`}
          onClick={handleNextClick}
          disabled={!acceptedTerms || loading}
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
