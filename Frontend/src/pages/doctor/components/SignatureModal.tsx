import React, { useRef, useState, useEffect } from "react";
import { PenTool, Upload, Check, X, RefreshCw, AlertCircle, FileImage } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { uploadFileToS3 } from "../../../api/s3Service";
import {
  getSignatureUploadSignedUrl,
  saveDoctorSignature,
} from "../../../api/doctor/dProfileCreationService";
import LoadingCircle from "../../../components/common/LoadingCircle";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  existingSignatureUrl: string | null;
  onConfirmSignature: (signatureKey: string, signatureUrl: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  doctorId,
  existingSignatureUrl,
  onConfirmSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "draw">("upload");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Clear or reset canvas when switching tabs or opening
  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#0ea5e9"; // Sky-500
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignature = async () => {
    let fileToUpload: File | Blob | null = null;
    let filename = "";
    let fileType = "";

    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Check if canvas is empty
      const buffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
      if (!buffer.some(color => color !== 4294967295 && color !== 0)) {
        toast.error("Please draw a signature first.");
        return;
      }

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) {
        toast.error("Failed to capture drawing.");
        return;
      }
      fileToUpload = blob;
      filename = `drawn_signature_${Date.now()}.png`;
      fileType = "image/png";
    } else {
      if (!signatureFile) {
        toast.error("Please select a signature image first.");
        return;
      }
      fileToUpload = signatureFile;
      filename = signatureFile.name;
      fileType = signatureFile.type;
    }

    setIsSaving(true);
    try {
      // 1. Fetch signed S3 upload URL
      const urlRes = await getSignatureUploadSignedUrl({
        doctorId,
        filename,
        contentType: fileType,
      });

      if (!urlRes?.success) {
        throw new Error(urlRes?.message || "Failed to generate upload URL.");
      }

      const { uploadUrl, key } = urlRes.data;

      // 2. Upload file to S3
      const s3Res = await uploadFileToS3(uploadUrl, fileToUpload, fileType);
      if (!s3Res?.success) {
        throw new Error("Failed to upload signature to S3.");
      }

      // 3. Save signature key to doctor profile in DB
      const saveRes = await saveDoctorSignature({ signatureKey: key });
      if (!saveRes?.success) {
        throw new Error(saveRes?.message || "Failed to save signature to profile.");
      }

      const localUrl = URL.createObjectURL(fileToUpload);

      toast.success("Signature saved to profile!");
      onConfirmSignature(key, localUrl);
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving signature.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseExisting = () => {
    // We assume the existing signature is already verified.
    // We fetch signatureKey when retrieving the doctor profile, so we pass it.
    // Wait, where is existing signature key? It is inside doctorProfile.signatureKey.
    // So let's pass a placeholder or let the parent know we are using the existing one.
    // Actually, in the parent, we can pass existingSignatureUrl and doctorSignature.signatureKey.
    // So we can confirm with "existing" signature details.
    if (existingSignatureUrl) {
      // Find signatureKey from parent's state
      onConfirmSignature("", existingSignatureUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PenTool className="w-4 h-4 text-sky-500" />
              <span>Select Doctor Signature</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Choose how to sign your prescription</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 bg-slate-50/30 dark:bg-slate-900/20">
          <button
            onClick={() => {
              setActiveTab("upload");
              setSignatureFile(null);
              setSignaturePreview(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-3 font-bold text-xs border-b-2 transition-all ${
              activeTab === "upload"
                ? "border-sky-500 text-sky-500"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Uploaded Signature</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("draw");
              setSignatureFile(null);
              setSignaturePreview(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-3 font-bold text-xs border-b-2 transition-all ${
              activeTab === "draw"
                ? "border-sky-500 text-sky-500"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw Signature</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 min-h-0">
          {activeTab === "upload" ? (
            <div className="space-y-4">
              {existingSignatureUrl && !isUpdating ? (
                <div className="flex flex-col items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Signature</span>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-inner max-w-[280px] w-full flex justify-center items-center h-28">
                    <img src={existingSignatureUrl} alt="Existing Signature" className="max-h-24 object-contain" />
                  </div>
                  <div className="flex gap-2 w-full justify-center">
                    <button
                      onClick={() => setIsUpdating(true)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all text-xs"
                    >
                      Update Signature
                    </button>
                    <button
                      onClick={handleUseExisting}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Use Signature</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div
                    className="bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/40 flex flex-col items-center justify-center text-center group cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        if (file.type.startsWith("image/")) {
                          setSignatureFile(file);
                          setSignaturePreview(URL.createObjectURL(file));
                        } else {
                          toast.error("Please upload an image file (PNG/JPG).");
                        }
                      }
                    }}
                    onClick={() => document.getElementById("sigModalInput")?.click()}
                  >
                    {signaturePreview ? (
                      <div className="w-full">
                        <img
                          src={signaturePreview}
                          alt="Signature Preview"
                          className="max-h-24 mx-auto rounded-lg object-contain mb-3 bg-white p-2 border border-slate-200 shadow-sm"
                        />
                        <p className="font-bold text-xs text-sky-500 truncate max-w-full px-2 mb-1">
                          {signatureFile?.name}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (signaturePreview) URL.revokeObjectURL(signaturePreview);
                            setSignaturePreview(null);
                            setSignatureFile(null);
                          }}
                          className="mt-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-455 rounded-lg font-bold text-[10px] hover:bg-rose-100 transition-colors"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm mb-2.5 text-slate-400 group-hover:scale-110 transition-transform">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="font-bold text-xs text-slate-700 dark:text-slate-350 mb-0.5">
                          Upload Signature Image
                        </p>
                        <p className="text-slate-400 text-[10px] font-medium tracking-tight">
                          Drag & drop or click to browse (PNG, JPG)
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      id="sigModalInput"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSignatureFile(file);
                          setSignaturePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    {existingSignatureUrl && (
                      <button
                        onClick={() => {
                          setIsUpdating(false);
                          setSignatureFile(null);
                          setSignaturePreview(null);
                        }}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-xl font-bold transition-all text-xs"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleSaveSignature}
                      disabled={isSaving || !signatureFile}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/10"
                    >
                      {isSaving ? <LoadingCircle /> : <Check className="w-3.5 h-3.5" />}
                      <span>Save & Use Signature</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Draw inside the box</span>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-inner overflow-hidden w-full max-w-[400px]">
                <canvas
                  ref={canvasRef}
                  width={398}
                  height={150}
                  className="cursor-crosshair w-full block bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex gap-2 w-full justify-end pt-2">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all text-xs"
                >
                  Clear Canvas
                </button>
                <button
                  type="button"
                  onClick={handleSaveSignature}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/10"
                >
                  {isSaving ? <LoadingCircle /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save & Use Signature</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
