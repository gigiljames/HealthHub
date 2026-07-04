import React from "react";
import { useNavigate } from "react-router";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  document.title = "Page Not Found | HealthHub";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 font-sans transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 sm:p-10 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center border border-red-200 dark:border-red-800 shadow-lg shadow-red-500/10">
            <FileQuestion className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">404 - Not Found</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            the page that you're looking for doesn't exist.
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

export default NotFoundPage;
