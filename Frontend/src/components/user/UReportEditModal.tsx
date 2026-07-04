import React, { useState, useEffect } from "react";
import { X, Edit2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { updateUploadedDocument } from "../../api/uploadedDocumentsApi";
import { getSpecializationList } from "../../api/doctor/dProfileCreationService";

interface UReportEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDoc: any) => void;
  documentData: any;
}

const CATEGORIES = [
  "Blood Test",
  "X-Ray",
  "MRI",
  "CT Scan",
  "Prescription",
  "Discharge Summary",
  "Vaccination Record",
  "Other",
];

export const UReportEditModal: React.FC<UReportEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  documentData,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [specializationList, setSpecializationList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && documentData) {
      setTitle(documentData.title || "");
      
      const isCustomCat = documentData.customCategory ? true : false;
      setCategory(isCustomCat ? "Other" : (documentData.category || ""));
      setCustomCategory(documentData.customCategory || "");

      const isCustomSpec = documentData.customSpecialization ? true : false;
      setSpecialization(isCustomSpec ? "Other" : (documentData.specializationId || ""));
      setCustomSpecialization(documentData.customSpecialization || "");

      if (documentData.reportDate) {
        setReportDate(documentData.reportDate.split("T")[0]);
      } else {
        setReportDate("");
      }

      getSpecializationList().then((response) => {
        if (response?.success) {
          setSpecializationList(response.specializations || []);
        }
      });
    }
  }, [isOpen, documentData]);

  if (!isOpen || !documentData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!category) {
      toast.error("Please select a category.");
      return;
    }
    if (category === "Other" && !customCategory.trim()) {
      toast.error("Please enter custom category.");
      return;
    }
    if (!specialization) {
      toast.error("Please select a specialization.");
      return;
    }
    if (specialization === "Other" && !customSpecialization.trim()) {
      toast.error("Please enter custom specialization.");
      return;
    }
    if (!reportDate) {
      toast.error("Please enter report date.");
      return;
    }

    try {
      setIsSubmitting(true);

      const updateData = {
        title: title.trim(),
        category,
        customCategory: category === "Other" ? customCategory.trim() : undefined,
        specializationId: specialization === "Other" ? undefined : specialization,
        customSpecialization: specialization === "Other" ? customSpecialization.trim() : undefined,
        reportDate,
      };

      const res = await updateUploadedDocument(documentData.id, updateData);
      if (res.success) {
        toast.success("Document details updated successfully.");
        onSuccess(res.data);
        onClose();
      } else {
        throw new Error(res.message || "Failed to update details.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit2 className="text-emerald-500 w-5 h-5" />
            Edit Document Details
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* File Warning Indicator */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-550 dark:text-slate-450 leading-relaxed">
            Note: You are editing document details. The uploaded file itself cannot be changed. To replace the file, delete this record and upload a new one.
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Lab Blood Test - June 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Custom Category Input if "Other" */}
          {category === "Other" && (
            <div className="flex flex-col gap-1.5 animate-slide-down">
              <label className="text-xs font-bold text-slate-750 dark:text-slate-300">
                Custom Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter custom category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>
          )}

          {/* Specialization */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Doctor Specialization <span className="text-rose-500">*</span>
            </label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="" disabled>Select a specialization</option>
              {specializationList.map((spec) => (
                <option key={spec._id || spec.id} value={spec._id || spec.id}>
                  {spec.name}
                </option>
              ))}
              <option value="Other">Other (Self Enter)</option>
            </select>
          </div>

          {/* Custom Specialization Input if "Other" */}
          {specialization === "Other" && (
            <div className="flex flex-col gap-1.5 animate-slide-down">
              <label className="text-xs font-bold text-slate-750 dark:text-slate-300">
                Custom Specialization Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter doctor specialization field"
                value={customSpecialization}
                onChange={(e) => setCustomSpecialization(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>
          )}

          {/* Report Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Date of Report <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 leading-relaxed font-semibold flex gap-1 items-start">
              <AlertCircle size={12} className="text-amber-500 mt-0.5 shrink-0" />
              Note: This date determines the display order for the doctor. Files are listed in newest first order.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title || !category || !specialization || !reportDate}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
