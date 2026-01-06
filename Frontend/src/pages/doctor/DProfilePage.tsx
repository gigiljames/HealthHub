import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import DProfileBasicInformation from "../../components/doctor/profile/DProfileBasicInformation";
import DProfileEducation from "../../components/doctor/profile/DProfileEducation";
import DProfileExperience from "../../components/doctor/profile/DProfileExperience";
import DProfileDocuments from "../../components/doctor/profile/DProfileDocuments";
import DNavbar from "../../components/doctor/DNavbar";

function DProfilePage() {
  const name = useSelector((state: RootState) => state.userInfo.name);
  const [activeTab, setActiveTab] = useState(0);

  if (name) {
    document.title = name + " | HealthHub";
  } else {
    document.title = "Doctor Profile";
  }

  const tabs = [
    "Overview",
    "Basic Information",
    "Education",
    "Experience",
    "Documents",
  ];

  return (
    <div className="bg-[#F5F7FA] min-h-screen">
      <DNavbar />
      <div className="flex justify-center w-full">
        <div className="w-[90%] lg:w-[80%] py-6">
          <div className="text-3xl font-bold ml-4 mb-6">Doctor Profile</div>

          <div className="flex flex-col lg:flex-row w-full gap-6">
            <div className="lg:w-1/4">
              <ul className="p-5 bg-white border-1 border-gray-200 rounded-2xl font-semibold sticky top-24">
                {tabs.map((tab, index) => (
                  <li
                    key={index}
                    className={`mb-2 p-3 px-4 rounded-md cursor-pointer transition-all duration-200 ${
                      activeTab === index
                        ? "bg-lightGreen"
                        : "bg-white hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab(index)}
                  >
                    {tab}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 pb-10">
              {activeTab === 0 && (
                <div className="flex flex-col gap-6">
                  <DProfileBasicInformation />
                  <DProfileEducation />
                  <DProfileExperience />
                  <DProfileDocuments />
                </div>
              )}
              {activeTab === 1 && <DProfileBasicInformation />}
              {activeTab === 2 && <DProfileEducation />}
              {activeTab === 3 && <DProfileExperience />}
              {activeTab === 4 && <DProfileDocuments />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DProfilePage;
