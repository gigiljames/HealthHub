import { useDispatch, useSelector } from "react-redux";
import getIcon from "../../helpers/getIcon";
import type { RootState } from "../../state/store";
import { toggleTheme } from "../../state/theme/themeSlice";
import Avatar from "../common/Avatar";

interface DNavbarProps {
  onMenuClick?: () => void;
  onNotifClick?: () => void;
}

function DNavbar({ onMenuClick, onNotifClick }: DNavbarProps) {
  const { name } = useSelector((state: RootState) => state.userInfo);
  const { profileImageUrl } = useSelector((state: RootState) => state.dProfileCreation);
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  return (
    <nav className="fixed lg:hidden top-0 left-0 right-0 h-[64px] bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors duration-300 z-50 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          {getIcon("burger-menu", "24px")}
        </button>
        <a href="/doctor/home" className="flex items-center gap-2">
          <img src="/HealthHub_logo.png" className="h-8 w-8 object-contain" alt="Logo" />
          <span className="font-bold text-lg text-darkGreen dark:text-lightGreen truncate xs:block hidden">HealthHub</span>
        </a>
      </div>

      <div className="flex items-center gap-3">


        {/* Notification Icon */}
        <button
          onClick={onNotifClick}
          className="relative p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M5.85 3.5a.75.75 0 0 0-1.117-1 9.719 9.719 0 0 0-2.348 4.876.75.75 0 0 0 1.479.248A8.219 8.219 0 0 1 5.85 3.5ZM19.267 2.5a.75.75 0 1 0-1.118 1 8.22 8.22 0 0 1 1.987 4.124.75.75 0 0 0 1.48-.248A9.72 9.72 0 0 0 19.266 2.5Z" />
            <path
              fillRule="evenodd"
              d="M12 2.25A6.75 6.75 0 0 0 5.25 9v.75a8.217 8.217 0 0 1-2.119 5.52.75.75 0 0 0 .298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 1 0 7.48 0 24.583 24.583 0 0 0 4.83-1.244.75.75 0 0 0 .298-1.205 8.217 8.217 0 0 1-2.118-5.52V9A6.75 6.75 0 0 0 12 2.25ZM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 0 0 4.496 0L14.25 18a2.25 2.25 0 0 1-4.5 0Z"
              clipRule="evenodd"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {getIcon(isDarkMode ? "moon" : "sun", "20px")}
        </button>

        <div className="text-right xs:block hidden">
          <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate max-w-[120px]">{name}</p>
          <p className="text-[10px] text-gray-500">Doctor</p>
        </div>
        {profileImageUrl ? (
          <Avatar
            src={profileImageUrl}
            className="w-9 h-9 rounded-full border border-gray-100 dark:border-slate-700 object-cover shadow-sm"
            alt="Profile"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-lightGreen/20 flex items-center justify-center text-darkGreen font-bold border border-gray-100 dark:border-slate-700 shadow-sm">
            {name?.charAt(0)}
          </div>
        )}
      </div>
    </nav>
  );
}

export default DNavbar;
