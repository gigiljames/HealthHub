import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import getIcon from "../../helpers/getIcon";
import type { RootState } from "../../state/store";
import { toggleTheme } from "../../state/theme/themeSlice";
import { logout } from "../../api/auth/authService";
import toast from "react-hot-toast";
import { persistor } from "../../state/store";
import { useNavigate } from "react-router";
import Avatar from "../common/Avatar";

interface DSidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

function DSidebar({ isMobileOpen, setIsMobileOpen }: DSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { name } = useSelector((state: RootState) => state.userInfo);
  const { profileImageUrl: doctorProfileUrl } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );

  const displayProfileImg = doctorProfileUrl;

  const menuItems = [
    { title: "Dashboard", icon: "dashboard", path: "/doctor/home" },
    { title: "Profile", icon: "profile", path: "/doctor/profile" },
    { title: "Slots", icon: "calendar", path: "/doctor/slots" },
    { title: "Wallet & Transactions", icon: "wallet", path: "/doctor/wallet" },
    { title: "Payouts", icon: "payout", path: "/doctor/payouts" },
    {
      title: "Practice Settings",
      icon: "settings",
      path: "/doctor/practice-settings",
    },
    { title: "Appointments", icon: "event-note", path: "/doctor/appointments" },
    { title: "Analysis", icon: "dashboard", path: "/doctor/analysis" },
  ];

  const footerItems = [
    { title: "Preferences", icon: "settings" },
    { title: "Dark mode", icon: isDarkMode ? "moon" : "sun", isToggle: true },
    { title: "Help", icon: "help" },
  ];

  async function handleLogout() {
    try {
      const data = await logout();
      if (data.success) {
        toast.success(data?.message || "Logged out successfully.");
      } else {
        toast.error(data?.message || "An error occurred while logging out");
      }
      dispatch({ type: "auth/logout" });
      persistor.purge();
      navigate("/doctor/login");
    } catch (error) {
      console.log(error);
      toast.error((error as Error).message);
    }
  }

  const sidebarContent = (
    <div
      className={`h-full flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-colors duration-300 shadow-xl relative`}
    >
      {/* Header */}
      <div
        className={`p-4 flex ${isCollapsed ? "flex-col items-center gap-4" : "items-center justify-between"}`}
      >
        <Link to="/doctor/home" className="flex items-center justify-center">
          {isCollapsed ? (
            <img src="/HealthHub_logo.png" className="h-8" alt="Logo" />
          ) : (
            <img
              src={isDarkMode ? "/Logo_with_text.png" : "/Logo_with_text_black.png"}
              className="h-10"
              alt="Logo"
            />
          )}
        </Link>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 transition-all ml-0"
        >
          {getIcon(isCollapsed ? "right" : "left", "18px")}
        </button>
      </div>

      {/* Search - only if not collapsed or as a tooltip-like thing */}
      {!isCollapsed && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg border border-gray-100 dark:border-slate-700">
            {getIcon("search", "18px", "gray")}
            <input
              type="text"
              placeholder="Quick search"
              className="bg-transparent border-none outline-none text-sm w-full dark:text-white"
            />
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="flex justify-center mb-4">
          <div className="p-2 text-gray-400 cursor-pointer">
            {getIcon("search", "22px")}
          </div>
        </div>
      )}

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
        {!isCollapsed && (
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">
            Menu
          </p>
        )}
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.title : ""}
              className={`flex items-center rounded-xl transition-all duration-200 group ${isCollapsed ? "justify-center p-2.5" : "gap-3 p-2.5"} ${
                location.pathname === item.path
                  ? "bg-lightGreen/20 text-darkGreen dark:text-lightGreen font-semibold"
                  : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-darkGreen dark:hover:text-lightGreen"
              }`}
            >
              <div
                className={`${location.pathname === item.path ? "scale-110" : "group-hover:scale-110"} transition-transform`}
              >
                {getIcon(item.icon, "20px")}
              </div>
              {!isCollapsed && (
                <span className="text-sm truncate">{item.title}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Items */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-1">
        {footerItems.map((item, idx) => (
          <div
            key={idx}
            onClick={item.isToggle ? () => dispatch(toggleTheme()) : undefined}
            className={`flex items-center rounded-lg cursor-pointer text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all ${isCollapsed ? "justify-center p-2" : "gap-3 p-2"}`}
            title={isCollapsed ? item.title : ""}
          >
            {getIcon(item.icon, "18px")}
            {!isCollapsed && <span className="text-sm">{item.title}</span>}
            {item.isToggle && !isCollapsed && (
              <div className="ml-auto">
                <div
                  className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? "bg-darkGreen" : "bg-gray-200"}`}
                >
                  <div
                    className={`bg-white w-3 h-3 rounded-full transition-transform transform ${isDarkMode ? "translate-x-4" : "translate-x-0"}`}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
        >
          <div className="relative group">
            {displayProfileImg ? (
              <Avatar
                src={displayProfileImg}
                className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover"
                alt="Avatar"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-lightGreen/20 flex items-center justify-center text-darkGreen font-bold border-2 border-white shadow-sm">
                {name?.charAt(0)}
              </div>
            )}
            <div
              className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={handleLogout}
            >
              {getIcon("logout", "14px", "white")}
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate">
                {name}
              </p>
              <p className="text-[10px] text-gray-500 truncate">Doctor</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              className="text-gray-400 hover:text-darkGreen transition-colors"
              onClick={handleLogout}
            >
              {getIcon("logout", "16px")}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-[60]"
      >
        {sidebarContent}
      </motion.aside>

      {/* Spacer for desktop */}
      <div
        className={`hidden lg:block transition-all duration-300 ${isCollapsed ? "w-20" : "w-[280px]"}`}
      />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen?.(false)}
              className="fixed inset-0 bg-black/50 z-[70] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 z-[80] lg:hidden shadow-2xl"
            >
              <div className="h-full flex flex-col">
                <div className="flex justify-end p-2 border-b border-gray-100 dark:border-slate-800 lg:hidden">
                  <button
                    onClick={() => setIsMobileOpen?.(false)}
                    className="p-2 text-gray-500"
                  >
                    {getIcon("close", "24px")}
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">{sidebarContent}</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default DSidebar;
