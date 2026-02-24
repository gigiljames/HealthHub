import { useDispatch, useSelector } from "react-redux";
import getIcon from "../../../helpers/getIcon";
import type { RootState } from "../../../state/store";
import { setOnlinePracticeFee } from "../../../state/doctor/dProfileCreationSlice";
import { useRef, useState } from "react";
import { setupPractice } from "../../../api/doctor/dProfileCreationService";
import toast from "react-hot-toast";
import { setOnboardingStep } from "../../../state/auth/userInfoSlice";

interface DOnboardingStep2AProps {
  setStep: (step: number) => void;
}

function DOnboardingStep2A({ setStep }: DOnboardingStep2AProps) {
  const dispatch = useDispatch();
  const onlinePracticeFee = useSelector(
    (state: RootState) => state.dProfileCreation.onlinePracticeFee,
  );
  const [consultationModes, setConsultationModes] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);
  const feeErrorRef = useRef<HTMLDivElement>(null);
  const modeErrorRef = useRef<HTMLDivElement>(null);

  const handleConsultationModeToggle = (mode: string) => {
    setConsultationModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  };

  async function handleSaveAndContinue() {
    let isValid = true;

    if (!onlinePracticeFee) {
      feeErrorRef.current?.classList.remove("hidden");
      isValid = false;
    } else {
      feeErrorRef.current?.classList.add("hidden");
    }

    if (consultationModes.length === 0) {
      modeErrorRef.current?.classList.remove("hidden");
      isValid = false;
    } else {
      modeErrorRef.current?.classList.add("hidden");
    }

    if (!isValid) return;

    errorRef.current?.classList.add("hidden");
    const practiceData = {
      consultationFee: onlinePracticeFee,
      practiceType: "ONLINE",
      consultationModes,
    };
    const response = await setupPractice(practiceData);
    console.log(response);
    if (response.success) {
      toast.success("Practice location saved successfully.");
      dispatch(setOnboardingStep(2));
      setStep(3);
    } else {
      toast.error(response.message);
    }
  }

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
              ref={feeErrorRef}
              className="hidden text-red-500 text-sm lg:text-base"
            >
              Please enter a valid fee.
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <p className="font-semibold">Consultation Modes</p>
              <div className="flex flex-wrap gap-2">
                {["VIDEO", "AUDIO", "CHAT"].map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg border-1 border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={consultationModes.includes(mode)}
                      onChange={() => handleConsultationModeToggle(mode)}
                      className="w-4 h-4 cursor-pointer accent-lightGreen"
                    />
                    <span className="text-sm capitalize">
                      {mode.toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
              <div
                ref={modeErrorRef}
                className="hidden text-red-500 text-sm lg:text-base"
              >
                Please select at least one consultation mode.
              </div>
            </div>

            <p className="text-gray-500 text-xs lg:text-sm flex items-center mt-2">
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
              onClick={handleSaveAndContinue}
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
