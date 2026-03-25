import { useSelector } from "react-redux";
import getIcon from "../../helpers/getIcon";
import type { RootState } from "../../state/store";

interface DNavbarProps {
  onMenuClick?: () => void;
}

function DNavbar({ onMenuClick }: DNavbarProps) {
  const { name } = useSelector((state: RootState) => state.userInfo);
  const { profileImageUrl } = useSelector((state: RootState) => state.dProfileCreation);

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
          <img src="/Logo_only.png" className="h-8 w-8 object-contain" alt="Logo" />
          <span className="font-bold text-lg text-darkGreen dark:text-lightGreen truncate xs:block hidden">HealthHub</span>
        </a>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right xs:block hidden">
          <p className="text-sm font-bold text-gray-800 dark:text-slate-200 truncate max-w-[120px]">{name}</p>
          <p className="text-[10px] text-gray-500">Doctor</p>
        </div>
        {profileImageUrl ? (
          <img 
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
