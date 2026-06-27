import { useEffect, useRef, useState } from "react";
import { setupPractice, getPracticeDetails } from "../../api/doctor/dProfileCreationService";
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

  const saveOnlineSettings = async (fee: number | undefined, modes: string[]) => {
    let isValid = true;

    if (!fee || fee <= 0) {
      feeErrorRef.current?.classList.remove("hidden");
      isValid = false;
    } else {
      feeErrorRef.current?.classList.add("hidden");
    }

    if (modes.length === 0) {
      modeErrorRef.current?.classList.remove("hidden");
      isValid = false;
    } else {
      modeErrorRef.current?.classList.add("hidden");
    }

    if (!isValid) return;

    errorRef.current?.classList.add("hidden");
    const practiceData = {
      consultationFee: fee,
      practiceType: "ONLINE",
      consultationModes: modes,
    };
    const response = await setupPractice(practiceData);
    if (response.success) {
      toast.success("Practice settings saved successfully.");
      const res = await getPracticeDetails();
      if (res.success && res.data.practiceLocations.length > 0) {
        dispatch(setOnlinePracticeFee(res.data.practiceLocations[0].consultationFee));
        setConsultationModes(res.data.practiceLocations[0].consultationModes);
      }
    } else {
      toast.error(response.message || "Failed to save practice settings.");
    }
  };

  const handleConsultationModeToggle = (mode: string) => {
    const nextModes = consultationModes.includes(mode)
      ? consultationModes.filter((m) => m !== mode)
      : [...consultationModes, mode];
    setConsultationModes(nextModes);
    saveOnlineSettings(onlinePracticeFee, nextModes);
  };
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
              onBlur={() => saveOnlineSettings(onlinePracticeFee, consultationModes)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
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
            <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-gray-200 text-xs text-slate-600 space-y-1.5 max-w-lg">
              <p className="font-bold text-slate-800">Note on Consultation Modes:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Video:</strong> Includes Video call, Audio call, and Chat.</li>
                <li><strong>Audio:</strong> Includes Audio call and Chat (no Video).</li>
                <li><strong>Chat:</strong> Includes Chat only (no Video or Audio).</li>
              </ul>
            </div>
            <div
              ref={modeErrorRef}
              className="hidden text-red-500 text-sm lg:text-base"
            >
              Please select at least one consultation mode.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DOnlinePracticeSettings;
