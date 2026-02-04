import { useEffect, useRef, useState } from "react";
import { setupPractice } from "../../api/doctor/dProfileCreationService";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { setOnlinePracticeFee } from "../../state/doctor/dProfileCreationSlice";

function DOnlinePracticeSettings() {
  const dispatch = useDispatch();
  const { onlinePracticeFee, practiceLocations } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  const [consultationModes, setConsultationModes] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);
  const feeErrorRef = useRef<HTMLDivElement>(null);
  const modeErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (practiceLocations.length === 1) {
      dispatch(setOnlinePracticeFee(practiceLocations[0].consultationFee));
      setConsultationModes(practiceLocations[0].consultationModes);
    } else {
      toast.error("Invalid practice locations");
      throw new Error("Invalid practice locations");
    }
  }, [practiceLocations]);

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
    } else {
      toast.error(response.message);
    }
  }
  return (
    <>
      <div className="bg-white rounded-2xl p-5 border-1 border-gray-200 max-w-3xl">
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
        </div>
        <div className="flex justify-end items-center mt-4">
          <button
            className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen"
            onClick={handleSaveAndContinue}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </>
  );
}

export default DOnlinePracticeSettings;
