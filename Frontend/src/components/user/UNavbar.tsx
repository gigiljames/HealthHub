import { useState, useEffect, useRef } from "react";
import getIcon from "../../helpers/getIcon";
import { Link } from "react-router";
import { logout } from "../../api/auth/authService";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { persistor, type RootState } from "../../state/store";
import { NotificationDropdown } from "../common/notifications/NotificationDropdown";

function UNavbar() {
  const dispatch = useDispatch();
  const { name, email } = useSelector((state: RootState) => state.userInfo);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      navigate("/login");
    } catch (error) {
      console.log(error);
      toast.error((error as Error).message);
    }
  }

  return (
    <>
      <div className="fixed w-full top-0 h-[70px] bg-white flex items-center px-4 md:px-10 lg:px-20 justify-between border-b-1 border-b-gray-200 z-50 shadow-sm">
        <a href="/">
          <img
            src="/Logo_with_text_black.png"
            className="h-[40px] md:h-[50px] cursor-pointer object-contain"
            alt="HealthHub"
          />
        </a>
        <div className="flex gap-2 md:gap-3 text-gray-400 relative items-center">
          <NotificationDropdown placement="bottom-right" />
          
          <div ref={dropdownRef} className="relative">
            <div
              className="flex items-center hover:cursor-pointer hover:bg-gray-150/50 px-1.5 py-1 md:p-2 rounded-xl transition-all duration-200"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="size-8 md:size-10 rounded-full bg-lightGreen/10 border border-lightGreen/30 text-darkGreen flex items-center justify-center font-bold text-sm md:text-base mr-1 uppercase">
                {name ? name.charAt(0) : "U"}
              </div>
              <div className="text-black/85 font-semibold text-sm md:text-base mr-1 hidden md:block select-none">{name}</div>
              <motion.div
                className="mt-0.5 hidden md:block"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {getIcon("chevron-down-solid", "18px", "black")}
              </motion.div>
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.ul
                  className="absolute top-12 md:top-14 right-0 bg-white shadow-[0px_8px_30px_rgb(0,0,0,0.12)] rounded-2xl text-black overflow-hidden min-w-[240px] z-50 border border-gray-100 py-1"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  onClick={() => setIsOpen(false)}
                >
                  <motion.li className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="font-semibold text-gray-900 leading-tight truncate">{name}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{email}</div>
                  </motion.li>
                  <div className="p-1">
                    <Link to="/doctors">
                      <motion.li className="list-none">
                        <div className="px-3 py-2.5 hover:bg-gray-100/70 rounded-xl flex items-center transition-colors">
                          {getIcon("search", "20px", "", "text-black/75")}
                          <span className="ml-3 text-sm font-medium text-gray-700">Search doctors</span>
                        </div>
                      </motion.li>
                    </Link>
                    <Link to="/profile">
                      <motion.li className="list-none">
                        <div className="px-3 py-2.5 hover:bg-gray-100/70 rounded-xl flex items-center transition-colors">
                          {getIcon("user", "18px", "", "text-black/75")}
                          <span className="ml-3 text-sm font-medium text-gray-700">Profile</span>
                        </div>
                      </motion.li>
                    </Link>
                    <Link to="/appointments">
                      <motion.li className="list-none">
                        <div className="px-3 py-2.5 hover:bg-gray-100/70 rounded-xl flex items-center transition-colors">
                          {getIcon("calendar", "18px", "", "text-black/75")}
                          <span className="ml-3 text-sm font-medium text-gray-700">Appointments</span>
                        </div>
                      </motion.li>
                    </Link>
                    <Link to="/chats">
                      <motion.li className="list-none">
                        <div className="px-3 py-2.5 hover:bg-gray-100/70 rounded-xl flex items-center transition-colors">
                          {getIcon("chat", "18px", "", "text-black/75")}
                          <span className="ml-3 text-sm font-medium text-gray-700">Chats</span>
                        </div>
                      </motion.li>
                    </Link>
                    <Link to="/medical-records">
                      <motion.li className="list-none">
                        <div className="px-3 py-2.5 hover:bg-gray-100/70 rounded-xl flex items-center transition-colors">
                          {getIcon("file-medical", "18px", "", "text-black/75")}
                          <span className="ml-3 text-sm font-medium text-gray-700">Medical Records</span>
                        </div>
                      </motion.li>
                    </Link>
                    <Link to="/wallet">
                      <motion.li className="list-none">
                        <div className="px-3 py-2.5 hover:bg-gray-100/70 rounded-xl flex items-center transition-colors">
                          {getIcon("wallet", "18px", "", "text-black/75")}
                          <span className="ml-3 text-sm font-medium text-gray-700">Wallet</span>
                        </div>
                      </motion.li>
                    </Link>
                    <Link to={"/settings"}>
                      <motion.li className="cursor-pointer list-none">
                        <div className="px-3 py-2.5 hover:bg-gray-100/70 rounded-xl flex items-center transition-colors">
                          {getIcon("settings", "20px", "", "text-black/75")}
                          <span className="ml-2.5 text-sm font-medium text-gray-700">Settings</span>
                        </div>
                      </motion.li>
                    </Link>
                    <hr className="border-gray-100 my-1" />
                    <motion.li className="cursor-pointer list-none" onClick={handleLogout}>
                      <div className="px-3 py-2.5 hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center transition-colors">
                        {getIcon("logout", "20px", "", "text-red-500/80")}
                        <span className="ml-2.5 text-sm font-medium">Logout</span>
                      </div>
                    </motion.li>
                  </div>
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

export default UNavbar;
