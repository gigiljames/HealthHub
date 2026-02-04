import { useDispatch, useSelector } from "react-redux";
import getIcon from "../../../helpers/getIcon";
import type { RootState } from "../../../state/store";
import { setPracticeType } from "../../../state/doctor/dProfileCreationSlice";
import { useRef } from "react";

interface DOnboardingStep1Props {
  setStep: (step: number) => void;
}
function DOnboardingStep1({ setStep }: DOnboardingStep1Props) {
  const dispatch = useDispatch();
  const errorRef = useRef<HTMLDivElement>(null);
  const practiceType = useSelector(
    (state: RootState) => state.dProfileCreation.practiceType,
  );
  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">How will you see patients?</h1>
        <p className="text-gray-500">
          Select the model that best fits your practice. You can always change
          this later in settings.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div
          className={` p-5 rounded-2xl bg-white ${
            practiceType === "ONLINE"
              ? "ring-[2.5px] ring-lightGreen"
              : "ring-1 ring-gray-200"
          }`}
          onClick={() => dispatch(setPracticeType("ONLINE"))}
        >
          <div className="text-2xl p-5 w-fit rounded-full bg-lightGreen/50 text-darkGreen mb-3">
            {getIcon("video")}
          </div>
          <h3 className="font-semibold">Online consultation only</h3>
          <p className="text-gray-500 text-xs lg:text-sm">
            Conduct video and audio consultations remotely via our secure
            platform
          </p>
        </div>
        <div
          className={` p-5 rounded-2xl bg-white ${
            practiceType === "MULTI_LOCATION"
              ? "ring-[2.5px] ring-lightGreen"
              : "ring-1 ring-gray-200"
          }`}
          onClick={() => dispatch(setPracticeType("MULTI_LOCATION"))}
        >
          <div className="text-2xl p-5 w-fit rounded-full bg-lightGreen/50 text-darkGreen mb-3">
            {getIcon("hospital")}
          </div>
          <h3 className="font-semibold">Clinic / Hospital + Online</h3>
          <p className="text-gray-500 text-xs lg:text-sm">
            In-person visits at a physical location combined with digital
            follow-ups.
          </p>
        </div>
      </div>
      <div
        ref={errorRef}
        className="hidden text-red-500 text-sm lg:text-base text-center"
      >
        Please select a practice type.
      </div>
      <div className="flex justify-between items-center pt-2">
        <p
          className="pl-2 text-gray-400 hover:text-gray-600 hover:underline font-base cursor-pointer"
          onClick={() => setStep(0)}
        >
          Back
        </p>
        <button
          className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-lg font-medium border-1 border-lightGreen"
          onClick={() => {
            if (practiceType === "") {
              errorRef.current?.classList.remove("hidden");
              return;
            }
            errorRef.current?.classList.add("hidden");
            setStep(2);
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default DOnboardingStep1;
