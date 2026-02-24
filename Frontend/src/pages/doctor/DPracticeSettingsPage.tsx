import { useEffect } from "react";
import DNavbar from "../../components/doctor/DNavbar";
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
  const { practiceType, practiceLocations } = useSelector(
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
    <>
      <div className="w-full min-h-screen overflow-y-auto bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col items-center pb-10">
        <DNavbar />
        <section className="pt-12 lg:pt-18 pb-4 w-[90%] lg:w-[60%] py-6  dark:bg-gray-900/50 transition-colors duration-300 flex flex-col items-center min-h-full">
          <div className="flex w-full mb-6">
            <div className="flex-1 py-4">
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
        </section>
      </div>
    </>
  );
}

export default DPracticeSettingsPage;
