import React, { useState } from "react";
import { X, Upload, FileText, Film, Image as ImageIcon, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getDisputeEvidenceUploadSignedUrl, submitDispute } from "../../api/disputeApi";
import { uploadFileToS3 } from "../../api/s3Service";

interface DisputeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  onSuccess?: (disputeData: any) => void;
}

const REASONS = [
  "Harassment",
  "Inappropriate Behaviour",
  "Abusive Language",
  "Fraud / Scam",
  "No Show",
  "Fake Information",
  "Prescription Misuse",
  "Spam",
  "Inappropriate Content",
  "Other",
];

const DisputeReportModal: React.FC<DisputeReportModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  onSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 evidence files.");
      return;
    }

    const validatedFiles: File[] = [];

    for (const file of files) {
      const fileType = file.type;
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileType.startsWith("image/")) {
        const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedImageTypes.includes(fileType)) {
          toast.error(`${file.name} is not an allowed image type (JPG, JPEG, PNG, WEBP).`);
          continue;
        }
        if (fileSizeMB > 10) {
          toast.error(`${file.name} exceeds the 10 MB limit for images.`);
          continue;
        }
      } else if (fileType.startsWith("video/")) {
        const allowedVideoTypes = ["video/mp4", "video/quicktime", "video/webm"];
        if (!allowedVideoTypes.includes(fileType)) {
          toast.error(`${file.name} is not an allowed video type (MP4, MOV, WEBM).`);
          continue;
        }
        if (fileSizeMB > 50) {
          toast.error(`${file.name} exceeds the 50 MB limit for videos.`);
          continue;
        }
      } else {
        toast.error(`${file.name} has an unsupported file format. Only images and videos are allowed.`);
        continue;
      }

      validatedFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...validatedFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Please select a reason for reporting.");
      return;
    }

    if (description.trim().length < 20) {
      toast.error("Description must be at least 20 characters.");
      return;
    }

    if (description.trim().length > 1000) {
      toast.error("Description cannot exceed 1000 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      const evidenceList: Array<{ key: string; name: string; type: string }> = [];

      // 1. Upload each evidence file to S3
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Uploading evidence ${i + 1} of ${selectedFiles.length}...`);

        const signedUrlRes = await getDisputeEvidenceUploadSignedUrl(file.name, file.type);
        if (!signedUrlRes.success || !signedUrlRes.uploadUrl || !signedUrlRes.key) {
          throw new Error(`Failed to initialize upload for ${file.name}`);
        }

        const uploadRes = await uploadFileToS3(signedUrlRes.uploadUrl, file, file.type);
        if (uploadRes && uploadRes.success === false) {
          throw new Error(`Failed to upload ${file.name} to storage.`);
        }

        evidenceList.push({
          key: signedUrlRes.key,
          name: file.name,
          type: file.type.startsWith("image/") ? "image" : "video",
        });
      }

      setUploadProgress("Submitting issue report...");

      // 2. Submit the dispute details
      const res = await submitDispute({
        appointmentId,
        reason,
        description: description.trim(),
        evidence: evidenceList,
      });

      toast.success("Issue reported successfully.");
      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-150 dark:border-gray-800 animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="text-red-500" size={20} />
            Report an Issue
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto custom-scrollbar">

          {/* Reason Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all font-medium text-sm"
            >
              <option value="" disabled>Select a reason</option>
              {REASONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Briefly explain what happened <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${description.length < 20 ? "text-gray-400" : "text-green-500"}`}>
                {description.length} / 1000
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              maxLength={1000}
              placeholder="Provide a detailed description of the issue (minimum 20 characters)..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm resize-none"
            />
            {description.length > 0 && description.length < 20 && (
              <p className="text-red-500 text-xs mt-0.5">Please write at least {20 - description.length} more characters.</p>
            )}
          </div>

          {/* Evidence Attachments */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Attach Evidence (Images/Videos)
            </label>

            {/* Upload Area */}
            <label className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex flex-col items-center justify-center gap-2 ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400">
                <Upload size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Click to upload files</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                Images (JPG, PNG, WEBP up to 10 MB) <br />
                Videos (MP4, MOV, WEBM up to 50 MB) <br />
                Max 5 files total.
              </p>
            </label>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Selected Files ({selectedFiles.length}/5)</p>
                {selectedFiles.map((file, idx) => {
                  const isImage = file.type.startsWith("image/");
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isImage ? (
                          <ImageIcon className="text-blue-500 shrink-0" size={16} />
                        ) : (
                          <Film className="text-purple-500 shrink-0" size={16} />
                        )}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[240px]">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason || description.trim().length < 20}
              className="px-6 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg hover:shadow-red-550/20 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-800 disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-xs">{uploadProgress || "Submitting..."}</span>
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default DisputeReportModal;
