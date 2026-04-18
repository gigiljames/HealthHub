import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import UProfileBasicInformation from "../../components/user/UProfileBasicInformation";
import UProfileContactInfo from "../../components/user/UProfileContactInfo";
import UProfileSurgery from "../../components/user/UProfileSurgery";
import UProfileIllness from "../../components/user/UProfileIllness";

function UProfilePage() {
  const name = useSelector((state: RootState) => state.userInfo.name);

  if (name) {
    document.title = name + " | HealthHub";
  } else {
    document.title = "Profile";
  }

  return (
    <>
      <div className="bg-[#F5F7FA] dark:bg-gray-950 min-h-screen pt-[70px] transition-colors duration-300">
        <div className="flex justify-center w-full">
          <div className="w-full md:w-[80%] max-w-7xl py-0 md:py-6 px-4 md:px-0">
            <div className="mb-8 pl-4">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                My Health Profile
              </h1>
              <p className="text-lg mb-6 text-gray-500 dark:text-gray-100">
                Keep your personal and medical information up to date for better
                care
              </p>
            </div>

            <div className="flex flex-col w-full gap-6 pb-10">
              <UProfileBasicInformation />
              <UProfileContactInfo />
              <UProfileIllness />
              <UProfileSurgery />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UProfilePage;
