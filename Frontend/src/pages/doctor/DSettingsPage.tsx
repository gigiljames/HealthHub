import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import ChangePassword from "../../components/common/ChangePassword";

function DSettingsPage() {
  const name = useSelector((state: RootState) => state.userInfo.name);
  const authType = useSelector((state: RootState) => state.userInfo.authType);

  if (name) {
    document.title = name + " - Settings | HealthHub";
  } else {
    document.title = "Settings";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your security, privacy, and account settings.
        </p>
      </div>

      <div className="w-full">
        {authType === "LOCAL" && <ChangePassword />}
      </div>
    </div>
  );
}

export default DSettingsPage;
