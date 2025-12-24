import { useState } from "react";
import getIcon from "../../helpers/getIcon";
import { Link } from "react-router";
import { logout } from "../../api/auth/authService";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { removeToken } from "../../state/auth/tokenSlice";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

function DNavbar() {
  const dispatch = useDispatch();
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
      dispatch(removeToken());
      navigate("/auth");
    } catch (error) {
      console.log(error);
      toast.error((error as Error).message);
    }
  }
  return (
    <>
      <div className="sticky z-1 top-0 h-[70px] bg-transparent bg-lightGreen flex items-center px-5 lg:px-20 justify-between border-b-1 border-b-gray-200 bg-white">
        <a href="/doctor/home">
          <img
            src="/Logo_with_text_black.png"
            className="h-[50px] cursor-pointer"
          />
        </a>
        <div className="md:flex gap-6 hidden text-gray-400 relative">
          <div
            className="flex items-center hover:cursor-pointer hover:bg-gray-100 p-2 rounded-md"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="size-10 rounded-full bg-gray-400"></div>
            <motion.div
              className="mt-0.5"
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {getIcon("arrow-down", "18px", "black")}
            </motion.div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.ul
                className="absolute top-15 right-0 bg-white shadow-sm rounded-md text-black overflow-hidden min-w-[150px] z-50"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                onClick={() => setIsOpen(false)}
              >
                <Link to="/doctor/profile">
                  <motion.li className=" p-1">
                    <div className="p-2 hover:bg-gray-100 rounded-sm">
                      Profile
                    </div>
                  </motion.li>
                </Link>
                <hr className="border-gray-200" />
                <motion.li
                  className="p-1 cursor-pointer"
                  onClick={handleLogout}
                >
                  <div className="p-2 hover:bg-gray-100 rounded-sm">Logout</div>
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

export default DNavbar;
