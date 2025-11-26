import ADoctorCard from "../../components/admin/ADoctorCard";
import AManageDoctors from "../../components/admin/AManageDoctors";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import { useAdminStore } from "../../zustand/adminStore";

function ADoctorManagement() {
  document.title = "Doctor management";
  const doctorManagementPage = useAdminStore(
    (state) => state.doctorManagementPage
  );
  const setDoctorManagementPage = useAdminStore(
    (state) => state.setDoctorManagementPage
  );
  const showDoctorCard = useAdminStore((state) => state.showDoctorCard);
  const toggleDoctorCard = useAdminStore((state) => state.toggleDoctorCard);
  function getPage() {
    switch (doctorManagementPage) {
      case "manage-doctors":
        return <AManageDoctors />;
      case "view-statistics":
        return <div>Doctor Statistics Component</div>;
    }
  }
  return (
    <>
      <AMobileSidebar page="doctor-management" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="doctor-management" />
        <div className="w-screen lg:flex-1">
          {showDoctorCard && (
            <div
              className="z-50 absolute top-0 left-0 w-full h-full bg-black/25 flex justify-center items-center"
              onClick={() => toggleDoctorCard()}
            >
              <ADoctorCard />
            </div>
          )}
          <div className="flex flex-col gap-1 p-2 h-screen overflow-y-auto">
            <div className="bg-gray-400/80 flex w-fit rounded-md text-white font-semibold">
              <button
                style={{
                  backgroundColor: `${
                    doctorManagementPage === "manage-doctors"
                      ? "#5C8D89"
                      : "transparent"
                  }`,
                }}
                className="px-5 py-1.5 rounded-l-md "
                onClick={() => setDoctorManagementPage("manage-doctors")}
              >
                Manage Doctors
              </button>
              <button
                style={{
                  backgroundColor: `${
                    doctorManagementPage === "view-statistics"
                      ? "#5C8D89"
                      : "transparent"
                  }`,
                }}
                className="px-5 py-1.5 rounded-r-md "
                onClick={() => setDoctorManagementPage("view-statistics")}
              >
                View Statistics
              </button>
            </div>
            {getPage()}
          </div>
        </div>
      </div>
    </>
  );
}

export default ADoctorManagement;
