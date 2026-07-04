import AManageUsers from "../../components/admin/AManageUsers";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";

function AUserManagement() {
  document.title = "User Management";

  return (
    <>
      <AMobileSidebar page="user-management" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="user-management" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-4 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-200 w-full animate-fade-in pb-10">
            
            {/* Page Header */}
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">User Management</h1>
            </div>

            {/* Main Area */}
            <div className="w-full mt-2">
              <AManageUsers />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default AUserManagement;
