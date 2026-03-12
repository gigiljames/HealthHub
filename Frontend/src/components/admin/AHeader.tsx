import { useAdminStore } from "../../zustand/adminStore";
import getIcon from "../../helpers/getIcon";

interface IHeaderProps {
  title: string;
}

function AHeader({ title }: IHeaderProps) {
  const toggleSidebar = useAdminStore((state) => state.toggle);
  return (
    <div className="flex items-center justify-between p-4 md:p-6 lg:px-8 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-gray-600 hover:text-darkGreen transition-colors"
          onClick={() => toggleSidebar()}
        >
          {getIcon("burger-menu", "24px")}
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
          <span className="text-sm font-medium text-gray-600">Admin</span>
        </div>
      </div>
    </div>
  );
}

export default AHeader;
