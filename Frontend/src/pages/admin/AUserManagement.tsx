import AManageUsers from "../../components/admin/AManageUsers";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import AUserCard from "../../components/admin/AUserCard";
import { useAdminStore } from "../../zustand/adminStore";

function AUserManagement() {
  document.title = "User management";
  const userManagementPage = useAdminStore((state) => state.userManagementPage);
  const showUserCard = useAdminStore((state) => state.showUserCard);
  const setUserManagementPage = useAdminStore(
    (state) => state.setUserManagementPage
  );
  const toggleUserCard = useAdminStore((state) => state.toggleUserCard);
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
        <div className="w-screen lg:flex-1 relative">
          {showUserCard && (
            <div
              className="z-50 absolute top-0 left-0 w-full h-full bg-black/25 flex justify-center items-center"
              onClick={() => toggleUserCard()}
            >
              <AUserCard />
            </div>
          )}
          <div className="flex flex-col gap-2 px-4 py-2.5 h-screen overflow-y-auto">
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
