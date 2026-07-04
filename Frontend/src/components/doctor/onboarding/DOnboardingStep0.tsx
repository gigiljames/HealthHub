import { useSelector } from "react-redux";
import getIcon from "../../../helpers/getIcon";
import type { RootState } from "../../../state/store";

interface DOnboardingStep0Props {
  name: string;
  setStep: (step: number) => void;
}

function DOnboardingStep0({ name, setStep }: DOnboardingStep0Props) {
  const { onboardingStep } = useSelector((state: RootState) => state.userInfo);
  const progress = Math.floor((onboardingStep / 6) * 100);
  return (
    <>
      <div className="flex flex-col gap-4 items-center justify-center bg-white rounded-2xl font-medium max-w-2xl p-4 py-10 h-fit border-1 border-gray-200">
        <div className="flex flex-col gap-2 items-center w-full">
          <div className="text-5xl p-6 rounded-full bg-lightGreen/50 text-darkGreen mb-3">
            {getIcon("stethoscope")}
          </div>
          <h1 className="font-bold text-center text-2xl lg:text-3xl">
            Welcome, Dr. {name}
          </h1>
          <p className="text-gray-500 w-4/5 lg:w-2/3 text-center text-sm lg:text-base">
            Complete your onboarding to start receiving patient appointments.
          </p>
          <p className="text-gray-400 text-xs lg:text-sm font-normal w-4/5 lg:w-2/3 text-center">
            Set up your practice, verify your profile, and go live on the
            platform. It only takes about 5 minutes.
          </p>
        </div>
        <div className="w-4/5 lg:w-2/3 flex flex-col gap-2">
          <div className="flex justify-between text-sm lg:text-base">
            <p>Onboarding progress</p>
            <p className="pr-2">{progress}%</p>
          </div>
          {/* Progress bar */}
          <div className="w-full overflow-hidden ">
            <div className="h-2 bg-gray-200/80 rounded-full">
              <div
                className="h-full bg-lightGreen rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          {onboardingStep === 0 && (
            <p className="text-xs lg:text-sm text-gray-400">
              Next step: Set up your practice
            </p>
          )}
          {onboardingStep === 2 && (
            <p className="text-xs lg:text-sm text-gray-400">
              Next step: Basic Information
            </p>
          )}
          {onboardingStep === 3 && (
            <p className="text-xs lg:text-sm text-gray-400">
              Next step: Professional background
            </p>
          )}
          {onboardingStep === 4 && (
            <p className="text-xs lg:text-sm text-gray-400">
              Next step: Upload documents
            </p>
          )}
          {onboardingStep === 5 && (
            <p className="text-xs lg:text-sm text-gray-400">
              Next step: Declaration & consent
            </p>
          )}
          {onboardingStep === 6 && (
            <p className="text-xs lg:text-sm text-gray-400">
              Next step: Onboarding completed
            </p>
          )}
        </div>
        <button
          className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-lg font-medium border-1 border-lightGreen"
          onClick={() => setStep(onboardingStep + 1)}
        >
          {onboardingStep === 0 && "Start Onboarding"}
          {onboardingStep > 0 && "Continue Onboarding"}
        </button>
      </div>
    </>
  );
}

export default DOnboardingStep0;
