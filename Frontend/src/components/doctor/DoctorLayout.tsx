import { useState } from "react";
import DSidebar from "./DSidebar";
import DNavbar from "./DNavbar";
import { Outlet } from "react-router";

const DoctorLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <DSidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 ">
        <DNavbar onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
