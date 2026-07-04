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
    <section className="pb-4 w-full flex flex-col items-center min-h-full">
      <div className="max-w-7xl flex flex-col justify-center">
        <div className="flex w-full mb-6">
          <div className="flex-1 pb-4">
            <h1 className="text-[24px] md:text-[32px] font-bold mb-1">
              Practice Settings
            </h1>
            <p className="text-[14px] md:text-[16px] font-medium  text-slate-500">
              Manage your practice settings
            </p>
          </div>
        </div>
        <div className="w-full">
          {practiceType === "ONLINE" && <DOnlinePracticeSettings />}
          {practiceType === "MULTI_LOCATION" && (
            <DMultiLocationPracticeSettings />
          )}
        </div>
      </div>
    </section>
  );
}

export default DPracticeSettingsPage;
