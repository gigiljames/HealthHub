import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import UNavbar from "../../components/user/UNavbar";
import { useUserStore } from "../../zustand/userStore";
import UProfileBasicInformation from "../../components/user/UProfileBasicInformation";
import UProfileContactInfo from "../../components/user/UProfileContactInfo";
import UProfileSurgery from "../../components/user/UProfileSurgery";
import UProfileIllness from "../../components/user/UProfileIllness";

function UProfilePage() {
  const name = useSelector((state: RootState) => state.userInfo.name);
  const profileComponent = useUserStore((state) => state.profileComponent);
  const setProfileComponent = useUserStore(
    (state) => state.setProfileComponent
  );
  if (name) {
    document.title = name + " | HealthHub";
  } else {
    document.title = "Profile";
  }

  return (
    <>
      <div className="bg-[#F5F7FA] min-h-screen">
        <UNavbar />
        <div className="flex justify-center w-full">
          <div className="w-[80%] py-6">
            <div className="text-3xl font-bold ml-4 mb-6">User Profile</div>

            <div className="flex w-full justify-around gap-6">
              <div className="">
                <ul className="p-5 bg-white border-1 border-gray-200 rounded-2xl font-semibold sticky top-24">
                  <li
                    className={`mb-2 ${profileComponent === 0 ? "bg-lightGreen" : "bg-white hover:bg-gray-100"} transition-all duration-200  p-3 px-4 rounded-md cursor-pointer`}
                    onClick={() => setProfileComponent(0)}
                  >
                    Overview
                  </li>
                  <li
                    className={`mb-2 ${profileComponent === 1 ? "bg-lightGreen" : "bg-white hover:bg-gray-100"} transition-all duration-200  p-3 px-4 rounded-md cursor-pointer`}
                    onClick={() => setProfileComponent(1)}
                  >
                    Basic Information
                  </li>
                  <li
                    className={`mb-2 ${profileComponent === 2 ? "bg-lightGreen" : "bg-white hover:bg-gray-100"} transition-all duration-200 p-3 px-4 rounded-md cursor-pointer`}
                    onClick={() => setProfileComponent(2)}
                  >
                    Contact Information & Body metrics
                  </li>
                  <li
                    className={`mb-2 ${profileComponent === 3 ? "bg-lightGreen" : "bg-white hover:bg-gray-100"} transition-all duration-200 p-3 px-4 rounded-md cursor-pointer`}
                    onClick={() => setProfileComponent(3)}
                  >
                    Previous Illnesses
                  </li>
                  <li
                    className={`mb-2 ${profileComponent === 4 ? "bg-lightGreen" : "bg-white hover:bg-gray-100"} transition-all duration-200 p-3 px-4 rounded-md cursor-pointer`}
                    onClick={() => setProfileComponent(4)}
                  >
                    Past surgeries
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-4 w-full pb-10 ">
                {profileComponent === 0 && (
                  <div className="flex flex-col gap-6">
                    <UProfileBasicInformation />
                    <UProfileContactInfo />
                    <UProfileIllness />
                    <UProfileSurgery />
                  </div>
                )}
                {profileComponent === 1 && <UProfileBasicInformation />}
                {profileComponent === 2 && <UProfileContactInfo />}
                {profileComponent === 3 && <UProfileIllness />}
                {profileComponent === 4 && <UProfileSurgery />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UProfilePage;
