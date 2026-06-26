import React, { useState, useEffect } from "react";
import { X, Upload, FileText, Calendar, Briefcase, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getPatientDocumentUploadSignedUrl, createUploadedDocument } from "../../api/uploadedDocumentsApi";
import { uploadFileToS3 } from "../../api/s3Service";
import { getSpecializationList } from "../../api/doctor/dProfileCreationService";

interface UReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export const UReportUploadModal: React.FC<UReportUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [specializationList, setSpecializationList] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    if (isOpen) {
      getSpecializationList().then((response) => {
        if (response?.success) {
          setSpecializationList(response.specializations || []);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF and Image (JPG, JPEG, PNG) files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size cannot exceed 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjsLib);
      };
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  };

  const generatePDFThumbnail = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result as ArrayBuffer);
          const pdfjsLib = await loadPdfJs();
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 0.6 });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (!context) {
            reject(new Error("Could not create canvas context."));
            return;
          }

          await page.render({ canvasContext: context, viewport: viewport }).promise;
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Thumbnail blob generation failed."));
              }
            },
            "image/jpeg",
            0.7
          );
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  const generateImageThumbnail = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const MAX_WIDTH = 250;
          const MAX_HEIGHT = 250;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          if (!ctx) {
            reject(new Error("Could not get canvas context."));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Image thumbnail generation failed."));
              }
            },
            "image/jpeg",
            0.7
          );
        };
        img.onerror = (err) => reject(err);
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

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
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadStatus("Preparing thumbnail...");

      // 1. Generate thumbnail
      let thumbnailBlob: Blob;
      if (selectedFile.type === "application/pdf") {
        thumbnailBlob = await generatePDFThumbnail(selectedFile);
      } else {
        thumbnailBlob = await generateImageThumbnail(selectedFile);
      }
      const thumbnailFile = new File([thumbnailBlob], `thumb_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // 2. Fetch S3 signed upload URLs
      setUploadStatus("Requesting storage upload tokens...");
      const mainSignedUrlRes = await getPatientDocumentUploadSignedUrl(
        selectedFile.name,
        selectedFile.type
      );
      if (!mainSignedUrlRes.success || !mainSignedUrlRes.data?.uploadUrl) {
        throw new Error("Failed to get upload URL for the main file.");
      }

      const thumbSignedUrlRes = await getPatientDocumentUploadSignedUrl(
        thumbnailFile.name,
        thumbnailFile.type
      );
      if (!thumbSignedUrlRes.success || !thumbSignedUrlRes.data?.uploadUrl) {
        throw new Error("Failed to get upload URL for the thumbnail.");
      }

      const mainUrl = mainSignedUrlRes.data.uploadUrl;
      const mainKey = mainSignedUrlRes.data.key;
      const thumbUrl = thumbSignedUrlRes.data.uploadUrl;
      const thumbKey = thumbSignedUrlRes.data.key;

      // 3. Upload main file to S3
      setUploadStatus("Uploading report document...");
      const mainUploadRes = await uploadFileToS3(mainUrl, selectedFile, selectedFile.type);
      if (mainUploadRes && mainUploadRes.success === false) {
        throw new Error("Failed to upload the report to storage.");
      }

      // 4. Upload thumbnail to S3
      setUploadStatus("Uploading thumbnail preview...");
      const thumbUploadRes = await uploadFileToS3(thumbUrl, thumbnailFile, thumbnailFile.type);
      if (thumbUploadRes && thumbUploadRes.success === false) {
        throw new Error("Failed to upload the thumbnail preview.");
      }

      // 5. Create database entry
      setUploadStatus("Finalizing record database entry...");
      const createRes = await createUploadedDocument({
        title: title.trim(),
        category,
        customCategory: category === "Other" ? customCategory.trim() : undefined,
        specializationId: specialization === "Other" ? undefined : specialization,
        customSpecialization: specialization === "Other" ? customSpecialization.trim() : undefined,
        fileKey: mainKey,
        thumbnailKey: thumbKey,
        reportDate,
      });

      if (createRes.success) {
        toast.success("Document uploaded and saved successfully.");
        onSuccess();
        onClose();
      } else {
        throw new Error(createRes.message || "Failed to create database entry.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to upload document. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="text-emerald-500 w-5 h-5 animate-pulse" />
            Upload Medical Document
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

          {/* File Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Upload Report File <span className="text-rose-500">*</span>
            </label>
            <label className={`border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex flex-col items-center justify-center gap-1.5 ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload size={18} className="text-slate-400 dark:text-slate-550 mb-0.5" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {selectedFile ? selectedFile.name : "Click to select a file"}
              </span>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed font-medium">
                Supported formats: PDF, JPG, PNG (Max 10MB)
              </p>
            </label>
          </div>

          {/* Loader or submit actions */}
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
              disabled={isSubmitting || !title || !category || !specialization || !reportDate || !selectedFile}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:bg-slate-250 dark:disabled:bg-slate-800 disabled:text-slate-450"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{uploadStatus}</span>
                </>
              ) : (
                "Upload Document"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
