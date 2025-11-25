import AManageHospitals from "../../components/admin/AManageHospitals";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import { useAdminStore } from "../../zustand/adminStore";

function AHospitalManagement() {
  document.title = "Hospital management";
  const hospitalManagementPage = useAdminStore(
    (state) => state.hospitalManagementPage
  );
  const setHospitalManagementPage = useAdminStore(
    (state) => state.setHospitalManagementPage
  );
  function getPage() {
    switch (hospitalManagementPage) {
      case "manage-hospitals":
        return <AManageHospitals />;
      case "view-statistics":
        return <div>Hospital Statistics Component</div>;
    }
  }
  return (
    <>
      <AMobileSidebar page="hospital-management" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="hospital-management" />
        <div className="w-screen lg:flex-1">
          <div className="flex flex-col gap-1 p-2 h-screen overflow-y-auto">
            <div className="bg-gray-400/80 flex w-fit rounded-md text-white font-semibold">
              <button
                style={{
                  backgroundColor: `${
                    hospitalManagementPage === "manage-hospitals"
                      ? "#5C8D89"
                      : "transparent"
                  }`,
                }}
                className="px-5 py-1.5 rounded-l-md "
                onClick={() => setHospitalManagementPage("manage-hospitals")}
              >
                Manage Hospitals
              </button>
              <button
                style={{
                  backgroundColor: `${
                    hospitalManagementPage === "view-statistics"
                      ? "#5C8D89"
                      : "transparent"
                  }`,
                }}
                className="px-5 py-1.5 rounded-r-md "
                onClick={() => setHospitalManagementPage("view-statistics")}
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

export default AHospitalManagement;
