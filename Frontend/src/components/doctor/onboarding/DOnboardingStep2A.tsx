import { useDispatch, useSelector } from "react-redux";
import getIcon from "../../../helpers/getIcon";
import type { RootState } from "../../../state/store";
import { setOnlinePracticeFee } from "../../../state/doctor/dProfileCreationSlice";
import { useRef } from "react";

interface DOnboardingStep2AProps {
  setStep: (step: number) => void;
}

function DOnboardingStep2A({ setStep }: DOnboardingStep2AProps) {
  const dispatch = useDispatch();
  const onlinePracticeFee = useSelector(
    (state: RootState) => state.dProfileCreation.onlinePracticeFee,
  );
  const errorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="max-w-3xl flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Set your online consultation fee</h1>
        <p className="text-gray-500">
          Choose a fee that reflects your experience. Patients will see this
          amount before booking.
        </p>
        <div className="bg-white rounded-2xl p-5 ">
          <div className="flex flex-col gap-2">
            <p className="font-semibold">Fee per session</p>
            <div className="w-full border-1 border-gray-300 rounded-md p-1 h-12 flex items-center gap-3 px-3 focus-within:ring-2 focus-within:ring-lightGreen">
              <p className="text-xl font-semibold text-gray-500 size-6 flex items-center justify-center">
                ₹
              </p>
              <div className="w-[1px] bg-gray-300 h-full"></div>
              <input
                type="number"
                className="w-full h-full outline-none text-xl font-bold no-spinners"
                value={onlinePracticeFee}
                onChange={(e) =>
                  dispatch(setOnlinePracticeFee(Number(e.target.value)))
                }
              />
            </div>
            <div
              ref={errorRef}
              className="hidden text-red-500 text-sm lg:text-base"
            >
              Please enter a valid fee.
            </div>
            <p className="text-gray-500 text-xs lg:text-sm flex items-center">
              {getIcon("info")}{" "}
              <span className="ml-2">
                You can update this later in you profile settings.
              </span>
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p
              className="pl-2 text-gray-400 hover:text-gray-600 hover:underline font-base cursor-pointer"
              onClick={() => setStep(1)}
            >
              Back
            </p>
            <button
              className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen"
              onClick={() => {
                if (!onlinePracticeFee) {
                  errorRef.current?.classList.remove("hidden");
                  return;
                }
                errorRef.current?.classList.add("hidden");
                setStep(3);
              }}
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DOnboardingStep2A;
