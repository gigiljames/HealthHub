import React, { useState, useEffect } from "react";
import { X, Search, AlertTriangle } from "lucide-react";

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;
  title: string;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [loadStatus, setLoadStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    if (isOpen) {
      setZoomScale(1);
      setLoadStatus("loading");
    }
  }, [isOpen, url]);

  if (!isOpen || !url) return null;

  const isPdf = url.endsWith(".pdf") || url.includes(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full h-full overflow-hidden flex flex-col animate-in zoom-in-98 duration-200 rounded-xl max-w-5xl max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-start px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500 w-5 h-5 shrink-0">📄</span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate" title={title}>
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar with Zoom Controls */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Search size={12} />
            <span>Document Preview</span>
          </span>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loadStatus !== "loaded"}
              onClick={() => setZoomScale((s) => Math.max(0.5, s - 0.15))}
              className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom Out"
            >
              Zoom Out (-)
            </button>
            <span className="text-[10px] font-bold text-slate-500 min-w-10 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              disabled={loadStatus !== "loaded"}
              onClick={() => setZoomScale((s) => Math.min(2.5, s + 0.15))}
              className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Zoom In"
            >
              Zoom In (+)
            </button>
            <button
              type="button"
              disabled={loadStatus !== "loaded"}
              onClick={() => setZoomScale(1)}
              className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reset Zoom"
                >
              Reset
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-955 p-6 flex items-start justify-center min-h-0 relative w-full h-full">
          {loadStatus === "loading" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-955 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              <p className="text-xs font-semibold text-slate-500">Loading document preview...</p>
            </div>
          )}

          {loadStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-955 z-10">
              <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Failed to load document preview</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                The file could not be retrieved or is in an unsupported format. Please try downloading the certificate to view it.
              </p>
            </div>
          )}

          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease-out",
              width: isPdf ? "100%" : "auto",
              height: isPdf ? "100%" : "auto",
              display: loadStatus === "loaded" ? "flex" : "none",
            }}
            className="items-center justify-center max-w-full max-h-full min-h-0 w-full h-full"
          >
            {isPdf ? (
              <iframe
                src={url}
                onLoad={() => setLoadStatus("loaded")}
                className="w-full h-full border-none rounded-xl bg-white shadow-md min-h-[60vh]"
                title={title}
              />
            ) : (
              <img
                src={url}
                alt={title}
                onLoad={() => setLoadStatus("loaded")}
                onError={() => setLoadStatus("error")}
                className="max-w-[95%] max-h-[70vh] object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-800"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
