import { useState } from "react";
import DOnboardingNavbar from "../../components/doctor/onboarding/DOnboardingNavbar";
import DOnboardingStep0 from "../../components/doctor/onboarding/DOnboardingStep0";
import { useSelector } from "react-redux";
import { type RootState } from "../../state/store";
import { Link } from "react-router";
import DOnboardingStep1 from "../../components/doctor/onboarding/DOnboardingStep1";
import DOnboardingStep2A from "../../components/doctor/onboarding/DOnboardingStep2A";
import DOnboardingStep2B from "../../components/doctor/onboarding/DOnboardingStep2B";
import DOnboardingStep3 from "../../components/doctor/onboarding/DOnboardingStep3";
import DOnboardingStep4 from "../../components/doctor/onboarding/DOnboardingStep4";
import DOnboardingStep5 from "../../components/doctor/onboarding/DOnboardingStep5";
import DOnboardingCompleted from "../../components/doctor/onboarding/DOnboardingCompleted";
import DOnboardingStep6 from "../../components/doctor/onboarding/DOnboardingStep6";

function DOnboarding() {
  const [step, setStep] = useState(0);
  const practiceType = useSelector(
    (state: RootState) => state.dProfileCreation.practiceType,
  );
  const name = useSelector((state: RootState) => state.userInfo.name);
  return (
    <>
      <DOnboardingNavbar />
      <div className="h-screen overflow-y-auto bg-gray-100 pt-27 flex flex-col items-center px-3 pb-10">
        {/* Progress bar */}
        {step > 0 && (
          <div className="w-full flex flex-col gap-2 mb-10 max-w-3xl">
            <div className="flex justify-between">
              <p className="text-lg lg:text-xl font-semibold">
                {step === 1 && "Practice details"}
                {step === 2 && "Practice details"}
                {step === 3 && "Basic information"}
                {step === 4 && "Professional background"}
                {step === 5 && "Upload documents"}
                {step === 6 && "Declaration & consent"}
                {step === 7 && "Onboarding completed"}
              </p>
              <p className="text-sm lg:text-base text-gray-500">
                {step > 6 ? "Completed" : `Step ${step} of 6`}
                {" • "}
                <span className="font-semibold text-lg">
                  {step === 1 ? 5 : Math.floor(((step - 1) / 6) * 100)}%
                </span>
              </p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-lightGreen rounded-full transition-all duration-200"
                style={{
                  width: `${step - 1 <= 0 ? 5 : Math.floor(((step - 1) / 6) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        )}
        {step === 0 && <DOnboardingStep0 name={name} setStep={setStep} />}
        {step === 1 && <DOnboardingStep1 setStep={setStep} />}
        {practiceType === "ONLINE" && step === 2 && (
          <DOnboardingStep2A setStep={setStep} />
        )}
        {practiceType === "MULTI_LOCATION" && step === 2 && (
          <DOnboardingStep2B setStep={setStep} />
        )}
        {step === 3 && <DOnboardingStep3 setStep={setStep} />}
        {step === 4 && <DOnboardingStep4 setStep={setStep} />}
        {step === 5 && <DOnboardingStep5 setStep={setStep} />}
        {step === 6 && <DOnboardingStep6 setStep={setStep} />}
        {step === 7 && <DOnboardingCompleted name={name} />}
        <div className="flex flex-col gap-2 justify-center text-xs lg:text-sm mt-8">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={""}
              className="text-center text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              to={""}
              className="text-center text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:underline"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} HealthHub. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}

export default DOnboarding;
