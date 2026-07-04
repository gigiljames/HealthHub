import { useState } from "react";
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
      <div className="fixed w-full top-0 h-[70px] bg-lightGreen flex items-center px-5 lg:px-20 justify-between border-b-1 border-b-gray-200 bg-white z-50">
        <a href="/">
          <img
            src="/Logo_with_text_black.png"
            className="h-[50px] cursor-pointer"
          />
        </a>
        <div className="md:flex gap-3 hidden text-gray-400 relative items-center">
          <NotificationDropdown placement="bottom-right" />
          <div
            className="flex items-center hover:cursor-pointer hover:bg-gray-100 p-2 rounded-md"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="size-10 rounded-full bg-gray-400 mr-1"></div>
            <div className="text-black/80 font-medium mr-1">{name}</div>
            <motion.div
              className="mt-0.5"
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {getIcon("chevron-down-solid", "18px", "black")}
            </motion.div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.ul
                className="absolute top-14 right-0 bg-white shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)] rounded-md text-black overflow-hidden min-w-[230px] z-50"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                onClick={() => setIsOpen(false)}
              >
                <motion.li className="p-3">
                  <div className="font-medium">{name}</div>
                  <div className="font-thin text-sm text-gray-600">{email}</div>
                </motion.li>
                <hr className="border-gray-200" />
                <Link to="/doctors">
                  <motion.li className="">
                    <div className="p-3 hover:bg-gray-100 rounded-sm flex items-center">
                      {getIcon("search", "20px", "", "text-black/80")}
                      <span className="ml-3">Search doctors</span>
                    </div>
                  </motion.li>
                </Link>
                <Link to="/profile">
                  <motion.li className="">
                    <div className="p-3 hover:bg-gray-100 rounded-sm flex items-center">
                      {getIcon("user", "18px", "", "text-black/80")}
                      <span className="ml-3">Profile</span>
                    </div>
                  </motion.li>
                </Link>
                <Link to="/appointments">
                  <motion.li className="">
                    <div className="p-3 hover:bg-gray-100 rounded-sm flex items-center">
                      {getIcon("calendar", "18px", "", "text-black/80")}
                      <span className="ml-3">Appointments</span>
                    </div>
                  </motion.li>
                </Link>
                <Link to="/chats">
                  <motion.li className="">
                    <div className="p-3 hover:bg-gray-100 rounded-sm flex items-center">
                      {getIcon("chat", "18px", "", "text-black/80")}
                      <span className="ml-3">Chats</span>
                    </div>
                  </motion.li>
                </Link>
                <Link to="/medical-records">
                  <motion.li className="">
                    <div className="p-3 hover:bg-gray-100 rounded-sm flex items-center">
                      {getIcon("file-medical", "18px", "", "text-black/80")}
                      <span className="ml-3">Medical Records</span>
                    </div>
                  </motion.li>
                </Link>
                <Link to="/wallet">
                  <motion.li className="">
                    <div className="p-3 hover:bg-gray-100 rounded-sm flex items-center">
                      {getIcon("wallet", "18px", "", "text-black/80")}
                      <span className="ml-3">Wallet</span>
                    </div>
                  </motion.li>
                </Link>
                <Link to={"/settings"}>
                  <motion.li className="cursor-pointer">
                    <div className="p-3 hover:bg-gray-100 rounded-sm flex items-center">
                      {getIcon("settings", "20px", "", "text-black/80")}
                      <span className="ml-2.5">Settings</span>
                    </div>
                  </motion.li>
                </Link>
                <hr className="border-gray-200" />
                <motion.li className="cursor-pointer" onClick={handleLogout}>
                  <div className="p-3 hover:bg-gray-100 rounded-sm flex items-center">
                    {getIcon("logout", "20px", "", "text-black/80")}
                    <span className="ml-2.5">Logout</span>
                  </div>
                </motion.li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="md:hidden">{getIcon("burger-menu", "35px", "black")}</div>
    </>
  );
}

export default UNavbar;
