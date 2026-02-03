import { useState } from "react";
import getIcon from "../../../helpers/getIcon";
import { useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import toast from "react-hot-toast";
import { saveDoctorOnboardingStep6 } from "../../../api/doctor/dProfileCreationService";
import { useDispatch } from "react-redux";
import {
  setIsNewUser,
  setOnboardingStep,
} from "../../../state/auth/userInfoSlice";
import LoadingCircle from "../../common/LoadingCircle";

interface DOnboardingStep6Props {
  setStep: (step: number) => void;
}

function DOnboardingStep6({ setStep }: DOnboardingStep6Props) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const userInfo = useSelector((state: RootState) => state.userInfo);

  async function handleSubmit() {
    if (!acceptedTerms) {
      toast.error("Please accept the declaration and terms.");
      return;
    }
    const step6Data = {
      userId: userInfo.id,
      acceptedTerms,
      submissionDate: new Date().toISOString(),
    };
    setLoading(true);
    try {
      const data = await saveDoctorOnboardingStep6(step6Data);
      setLoading(false);
      if (data?.success) {
        toast.success(data?.message || "Onboarding completed successfully.");
        dispatch(setIsNewUser(false));
        dispatch(setOnboardingStep(6));
        setStep(7);
      } else {
        throw new Error("An error occurred. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        (error as Error)?.message || "An error occurred. Please try again.",
      );
    }
  }

  return (
    <>
      <div className="p-6 bg-white border-1 flex flex-col gap-4 border-gray-200 rounded-2xl max-w-3xl">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Declaration & Consent</h1>
          <p className="text-gray-500 text-sm lg:text-base">
            Please carefully review the legal declaration below before final
            submission. This confirms your professional standing and agreement
            to platform policies.
          </p>
        </div>
        <div className="border-1 border-gray-200 bg-gray-100 rounded-md p-4 min-h-[50px] text-gray-700 text-sm lg:text-base">
          **terms and conditions here**
        </div>
        <div className="flex gap-3 p-3 items-center">
          <input
            type="checkbox"
            name=""
            id=""
            className="w-5 h-5 accent-darkGreen"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <div className="flex flex-col">
            <p>I confirm that all information provided is accurate</p>
            <p className="text-gray-600 text-sm lg:text-base">
              I agree to the{" "}
              <a
                href=""
                className="text-darkGreen/80 hover:underline hover:text-darkGreen"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href=""
                className="text-darkGreen/80 hover:underline hover:text-darkGreen"
              >
                {" "}
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
        <div className="flex gap-1 p-2 rounded-md border-1 border-lightGreen bg-lightGreen/20">
          <div className="p-1 text-darkGreen">{getIcon("info")}</div>
          <div>
            <p className="text-sm lg:text-base font-medium">
              What happens next?
            </p>
            <p className="text-gray-600 text-xs lg:text-sm">
              Once submitted, our administration team will review your
              credentails for verification. You will recieve an email update
              regarding your application status within{" "}
              <span className="text-gray-700 font-medium">24-48 hours.</span>
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2 gap-3">
          <p
            className="pl-2 text-gray-400 hover:text-gray-600 hover:underline font-base cursor-pointer"
            onClick={() => setStep(5)}
          >
            Back
          </p>
          <button
            className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen flex items-center gap-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <LoadingCircle />}
            {loading ? "Submitting..." : "Submit Profile for Verification"}
          </button>
        </div>
      </div>
    </>
  );
}

export default DOnboardingStep6;
