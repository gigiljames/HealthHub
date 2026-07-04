import React from "react";
import { useNavigate } from "react-router";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";

export const ForbiddenPage: React.FC = () => {
  document.title = "Access Denied | HealthHub";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 font-sans transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 sm:p-10 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-955/30 flex items-center justify-center border border-amber-200 dark:border-amber-800 shadow-lg shadow-amber-500/10">
            <ShieldAlert className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">403 - Forbidden</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            access denied, you dont have permission to view this page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => navigate(-2)}
            className="flex-1 py-3 border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-3 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-955 hover:bg-slate-850 dark:hover:bg-emerald-400 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
