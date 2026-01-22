import { useEffect, useState } from "react";
import getIcon from "../../helpers/getIcon";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { Link } from "react-router";
import { toggleTheme } from "../../state/theme/themeSlice";

function UGuestNavbar() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      {/* <nav
        className={`fixed top-0 z-50 w-full h-[70px] flex items-center justify-between px-5 lg:px-20 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm"
            : "bg-transparent border-transparent"
        }`}
      > */}
      <nav
        className={`fixed top-0 z-50 w-full h-[70px] flex items-center justify-between px-5 lg:px-20 transition-all duration-300 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm`}
      >
        <Link to="/" className="flex items-center gap-2">
          {isDarkMode ? (
            <img
              src="/Logo_with_text.png"
              alt="HealthHub"
              className="h-[40px] md:h-[50px] object-contain"
            />
          ) : (
            <img
              src="/Logo_with_text_black.png"
              alt="HealthHub"
              className="h-[40px] md:h-[50px] object-contain"
            />
          )}
        </Link>

        <div className="hidden md:flex items-center gap-8 text-gray-500 dark:text-gray-400 font-medium">
          <Link
            to="/doctor"
            className="hover:text-darkGreen dark:hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            For Doctors
          </Link>
          <Link
            to="/hospital"
            className="hover:text-darkGreen dark:hover:text-emerald-400 transition-colors flex items-center gap-2"
          >
            For Hospitals
          </Link>

          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-yellow-500 dark:text-gray-300 text-xl"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? getIcon("moon") : getIcon("sun")}
          </button>

          <Link
            to="/auth"
            className="px-6 py-2 rounded-full border-2 border-lightGreen dark:border-emerald-500 text-darkGreen dark:text-emerald-400 hover:bg-lightGreen dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white transition-all duration-300 font-bold"
          >
            Login / Signup
          </Link>
        </div>

        <div className="md:hidden text-darkGreen dark:text-emerald-400 cursor-pointer flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="text-yellow-500 dark:text-gray-300 text-xl"
          >
            {isDarkMode ? getIcon("moon") : getIcon("sun")}
          </button>
          {getIcon("burger-menu", "30px", "currentColor")}
        </div>
      </nav>
    </>
  );
}

export default UGuestNavbar;
