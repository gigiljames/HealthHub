import { useEffect, useState } from "react";
import getIcon from "../../helpers/getIcon";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { Link } from "react-router";
import { toggleTheme } from "../../state/theme/themeSlice";

function DGuestNavbar() {
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
    <nav
      className={`fixed top-0 z-50 w-full h-[70px] flex items-center justify-between px-4 lg:px-20 transition-all duration-300 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b-[1.5px] border-gray-200 dark:border-gray-800`}
    >
      <Link to="/doctor" className="flex items-center gap-2">
        {isDarkMode ? (
          <img
            src="/Logo_with_text.png"
            alt="HealthHub"
            className="h-[30px] md:h-[50px] object-contain"
          />
        ) : (
          <img
            src="/Logo_with_text_black.png"
            alt="HealthHub"
            className="h-[30px] md:h-[50px] object-contain"
          />
        )}
      </Link>
      <div className="flex items-center gap-4 md:gap-8 text-gray-500 dark:text-gray-400 font-medium">
        <Link
          to="/"
          className="hover:text-darkGreen dark:hover:text-emerald-400 transition-colors flex items-center gap-2 text-xs md:text-base"
        >
          Not a Doctor?
        </Link>
        {/* <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-yellow-500 dark:text-gray-300 text-xl"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? getIcon("moon") : getIcon("sun")}
        </button> */}
        <Link
          to="/doctor/login"
          className="px-1.5 md:px-6 py-2 rounded-full bg-darkGreen dark:bg-emerald-600 text-white hover:bg-normalGreen dark:hover:bg-emerald-500 transition-all duration-300 font-bold shadow-md text-xs md:text-base"
        >
          Login / Signup
        </Link>
      </div>
    </nav>
  );
}

export default DGuestNavbar;
