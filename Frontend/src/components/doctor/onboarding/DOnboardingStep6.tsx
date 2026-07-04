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
        <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-5 h-[280px] overflow-y-auto text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex flex-col gap-4">
          <h3 className="font-bold text-base text-slate-800 dark:text-white">HealthHub Terms & Conditions for Medical Practitioners</h3>

          <section className="space-y-1">
            <h4 className="font-bold text-slate-700 dark:text-slate-200">1. Professional Veracity & Standing</h4>
            <p>
              By proceeding with onboarding, you certify that all information, certificates, qualifications, and the Medical Registration Number provided are completely accurate, truthful, and valid. You agree to immediately update HealthHub of any suspension, disciplinary actions, or revocation of your license to practice medicine.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-slate-700 dark:text-slate-200">2. Standards of Medical Care</h4>
            <p>
              You agree to maintain the highest standard of medical ethics and clinical care during teleconsultations. You are solely responsible for clinical decisions, diagnoses, treatment recommendations, and electronic prescriptions generated through the platform.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-slate-700 dark:text-slate-200">3. Patient Privacy & Confidentiality</h4>
            <p>
              You must treat all patient records, message exchanges, video call feeds, and clinical details as strictly confidential under applicable data protection regulations and medical secrecy laws. Unauthorised sharing of patient details or media is strictly prohibited.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-slate-700 dark:text-slate-200">4. Platform Fees & Financial Settlement</h4>
            <p>
              HealthHub reserves the right to charge facilitation fees from consultation transactions as agreed upon during setup. Payouts are subject to verification, dispute resolution periods, and platform transaction processing timelines.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="font-bold text-slate-700 dark:text-slate-200">5. Limitation of Liability</h4>
            <p>
              HealthHub operates solely as a digital technology facilitator connecting patients with registered doctors. The platform does not prescribe treatments, provide direct healthcare services, or assume liability for clinical outcomes, medical negligence, or malpractice disputes.
            </p>
          </section>
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
                // href=""
                className="text-darkGreen/80" //hover:underline hover:text-darkGreen

              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                // href=""
                className="text-darkGreen/80" //hover:underline hover:text-darkGreen
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
