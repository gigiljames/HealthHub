import AManageDoctors from "../../components/admin/AManageDoctors";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";

function ADoctorManagement() {
  document.title = "Doctor Management";

  return (
    <>
      <AMobileSidebar page="doctor-management" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="doctor-management" />
        <div className="w-screen lg:flex-1">
          <div className="flex flex-col gap-4 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-200 w-full animate-fade-in pb-10">
            
            {/* Page Header */}
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">Doctor Management</h1>
            </div>

            {/* Main Area */}
            <div className="w-full mt-2">
              <AManageDoctors />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ADoctorManagement;
