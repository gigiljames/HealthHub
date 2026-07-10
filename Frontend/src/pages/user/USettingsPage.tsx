import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import ChangePassword from "../../components/common/ChangePassword";

function USettingsPage() {
  const name = useSelector((state: RootState) => state.userInfo.name);
  const authType = useSelector((state: RootState) => state.userInfo.authType);

  if (name) {
    document.title = name + " - Settings | HealthHub";
  } else {
    document.title = "Settings";
  }

  return (
    <>
      <div className="w-full min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-4 pt-[80px] md:pt-[90px] pb-16">
          <div className="mb-6 md:mb-8 pl-1 sm:pl-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-1.5">
              Settings
            </h1>
            <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 text-gray-500 dark:text-gray-400">
              Manage your security, privacy, and application preferences
            </p>
          </div>

          <div className="flex w-full justify-around gap-6">
            <div className="flex flex-col gap-4 w-full pb-10">
              {authType === "LOCAL" && <ChangePassword />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default USettingsPage;
