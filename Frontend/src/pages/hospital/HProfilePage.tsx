import { useState, useEffect } from "react";
import HSidebar from "../../components/hospital/HSidebar";
import HProfileBasicInformation from "../../components/hospital/profile/HProfileBasicInformation";
import HProfileContactInfo from "../../components/hospital/profile/HProfileContactInfo";
import HProfileFeatures from "../../components/hospital/profile/HProfileFeatures";
import HProfileDocuments from "../../components/hospital/profile/HProfileDocuments";

function HProfilePage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    "Overview",
    "Basic Information",
    "Contact Information",
    "Features",
    "Documents",
  ];

  useEffect(() => {
    document.title = "Hospital Profile | HealthHub";
  }, []);

  return (
    <div className="flex">
      <HSidebar page="profile" />
      <div className="flex-1 min-h-screen bg-gray-50 overflow-y-auto h-screen">
        <div className="px-5 lg:px-20 py-10">
          <div className="text-3xl font-bold ml-4 mb-6">Hospital Profile</div>

          <div className="flex flex-col lg:flex-row w-full gap-6">
            <div className="lg:w-1/4">
              <ul className="p-5 bg-white border-1 border-gray-200 rounded-2xl font-semibold sticky top-5">
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
                  <HProfileBasicInformation />
                  <HProfileContactInfo />
                  <HProfileFeatures />
                  <HProfileDocuments />
                </div>
              )}
              {activeTab === 1 && <HProfileBasicInformation />}
              {activeTab === 2 && <HProfileContactInfo />}
              {activeTab === 3 && <HProfileFeatures />}
              {activeTab === 4 && <HProfileDocuments />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HProfilePage;
