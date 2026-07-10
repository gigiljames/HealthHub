import { useState } from "react";
import DSidebar from "./DSidebar";
import DNavbar from "./DNavbar";
import { Outlet } from "react-router";

const DoctorLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <DSidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        showNotifPanel={isNotifOpen}
        setShowNotifPanel={setIsNotifOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 ">
        <DNavbar
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          onNotifClick={() => setIsNotifOpen(true)}
        />
        <main className="flex-1 overflow-auto pt-[64px] lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
