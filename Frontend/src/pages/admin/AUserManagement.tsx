import AManageUsers from "../../components/admin/AManageUsers";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import { useAdminStore } from "../../zustand/adminStore";

function AUserManagement() {
  document.title = "User management";
  const userManagementPage = useAdminStore((state) => state.userManagementPage);
  const setUserManagementPage = useAdminStore(
    (state) => state.setUserManagementPage
  );
  function getPage() {
    switch (userManagementPage) {
      case "manage-users":
        return <AManageUsers />;
      case "view-statistics":
        return <div>User Statistics Component</div>;
    }
  }
  return (
    <>
      <AMobileSidebar page="user-management" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="user-management" />
        <div className="w-screen lg:flex-1">
          <div className="flex flex-col gap-1 p-2 h-screen overflow-y-auto">
            <div className="bg-gray-400/80 flex w-fit rounded-md text-white font-semibold">
              <button
                style={{
                  backgroundColor: `${
                    userManagementPage === "manage-users"
                      ? "#5C8D89"
                      : "transparent"
                  }`,
                }}
                className="px-5 py-1.5 rounded-l-md "
                onClick={() => setUserManagementPage("manage-users")}
              >
                Manage Users
              </button>
              <button
                style={{
                  backgroundColor: `${
                    userManagementPage === "view-statistics"
                      ? "#5C8D89"
                      : "transparent"
                  }`,
                }}
                className="px-5 py-1.5 rounded-r-md "
                onClick={() => setUserManagementPage("view-statistics")}
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

export default AUserManagement;
