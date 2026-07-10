import { useEffect } from "react";
import { getPracticeDetails } from "../../api/doctor/dProfileCreationService";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  setPracticeLocations,
  setPracticeType,
} from "../../state/doctor/dProfileCreationSlice";
import DMultiLocationPracticeSettings from "../../components/doctor/DMultiLocationPracticeSettings";
import DOnlinePracticeSettings from "../../components/doctor/DOnlinePracticeSettings";

function DPracticeSettingsPage() {
  const dispatch = useDispatch();
  const { practiceType } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  useEffect(() => {
    getPracticeDetails().then((res) => {
      if (res.success) {
        console.log(res.data);
        dispatch(setPracticeType(res.data.practiceType));
        dispatch(setPracticeLocations(res.data.practiceLocations));
      }
    });
  }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Practice Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          Configure clinic locations, session modes, and billing rates.
        </p>
      </div>

      <div className="w-full">
        {practiceType === "ONLINE" && <DOnlinePracticeSettings />}
        {practiceType === "MULTI_LOCATION" && (
          <DMultiLocationPracticeSettings />
        )}
      </div>
    </div>
  );
}

export default DPracticeSettingsPage;
