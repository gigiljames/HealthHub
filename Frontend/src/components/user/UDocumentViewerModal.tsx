import React, { useState, useEffect } from "react";
import { X, Search, Calendar, Briefcase, FileText } from "lucide-react";
import dayjs from "dayjs";
import { getUploadedDocument } from "../../api/uploadedDocumentsApi";

interface UDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
  initialTitle?: string;
  specializationList?: any[];
}

export const UDocumentViewerModal: React.FC<UDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documentId,
  initialTitle,
  specializationList,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (isOpen && documentId) {
      const fetchFreshUrl = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await getUploadedDocument(documentId);
          if (res.success && res.data) {
            setData(res.data);
          } else {
            throw new Error(res.message || "Failed to load document preview.");
          }
        } catch (err: any) {
          setError(err.message || "Failed to load document preview.");
        } finally {
          setLoading(false);
        }
      };

      fetchFreshUrl();
    } else {
      setData(null);
      setZoomScale(1);
    }
  }, [isOpen, documentId]);

  if (!isOpen || !documentId) return null;

  const handleResetZoom = () => setZoomScale(1);

  const displayTitle = data?.title || initialTitle || "Loading Document...";
  const isPdf = data?.fileKey?.endsWith(".pdf") || data?.fileUrl?.includes(".pdf");
  const specName = specializationList?.find(
    (s) => s._id === data?.specializationId || s.id === data?.specializationId
  )?.name || data?.customSpecialization || "General Practitioner";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full h-full overflow-hidden flex flex-col animate-in zoom-in-98 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="text-emerald-500 w-5 h-5 shrink-0" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate" title={displayTitle}>
                {displayTitle}
              </h3>
            </div>
            
            {/* Metadata Badges */}
            {data && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] font-semibold text-slate-550 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-450 uppercase tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                  {data.customCategory || data.category}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} className="text-slate-405" />
                  {specName}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-slate-405" />
                  Reported: {dayjs(data.reportDate).format("DD MMM YYYY")}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-202 transition-colors p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl cursor-pointer shrink-0 mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar with Zoom Controls */}
        <div className="bg-slate-50 dark:bg-slate-955 px-6 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Search size={12} />
            <span>Inline Document Preview</span>
          </span>
          
          {data && !loading && !error && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.max(0.5, s - 0.15))}
                className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-sm"
                title="Zoom Out"
              >
                Zoom Out (-)
              </button>
              <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400 min-w-10 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.min(2.5, s + 0.15))}
                className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-sm"
                title="Zoom In"
              >
                Zoom In (+)
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-6 flex items-start justify-center min-h-0 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-xs font-semibold text-slate-500">Retrieving fresh document access URL...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
              <p className="text-sm font-bold text-rose-500">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Go Back
              </button>
            </div>
          ) : data ? (
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out",
                width: isPdf ? "100%" : "auto",
                height: isPdf ? "calc(100vh - 160px)" : "auto",
              }}
              className="flex items-center justify-center max-w-full max-h-full min-h-0"
            >
              {isPdf ? (
                <iframe
                  src={data.fileUrl}
                  className="w-full h-full border-none rounded-2xl bg-white shadow-md min-w-[800px]"
                  title={data.title}
                />
              ) : (
                <img
                  src={data.fileUrl}
                  alt={data.title}
                  className="max-w-[95%] max-h-[80vh] object-contain rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-800/50"
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UDocumentViewerModal;
