import getIcon from "../../../helpers/getIcon";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import { useRef, useState, useEffect } from "react";
import {
  getDegreeCertificateUploadSignedUrl,
  getMedicalLicenseUploadSignedUrl,
  saveDoctorVerificationDocs,
  getSignatureUploadSignedUrl,
  saveDoctorSignature,
} from "../../../api/doctor/dProfileCreationService";
import toast from "react-hot-toast";
import { uploadFileToS3 } from "../../../api/s3Service";
import LoadingCircle from "../../common/LoadingCircle";
import { setCertificates, setSignatureKey, setSignatureUrl } from "../../../state/doctor/dProfileCreationSlice";
import { motion } from "framer-motion";

type PreviewFile = {
  file: File;
  previewUrl: string;
  type: "image" | "pdf";
};

function DProfileDocuments() {
  const { certificates, verificationStatus, signatureUrl, signatureKey } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  const dispatch = useDispatch();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "draw">("upload");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  useEffect(() => {
    if (activeTab === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeTab, isEditingSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#0d9488"; // Emerald 600
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

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
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

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
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
    let fileToUpload: File | null = null;
    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
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
      fileToUpload = new File([blob], `signature_${Date.now()}.png`, { type: "image/png" });
    } else {
      if (!signatureFile) {
        toast.error("Please select a signature image to upload.");
        return;
      }
      fileToUpload = signatureFile;
    }

    setUploadingSignature(true);
    try {
      const urlRes = await getSignatureUploadSignedUrl({
        doctorId: userInfo.id,
        filename: fileToUpload.name,
        contentType: fileToUpload.type,
      });

      if (!urlRes?.success) {
        throw new Error(urlRes?.message || "Failed to generate upload URL.");
      }

      const { uploadUrl, key } = urlRes.data;

      const s3Res = await uploadFileToS3(uploadUrl, fileToUpload, fileToUpload.type);
      if (!s3Res?.success) {
        throw new Error("Failed to upload signature image to S3.");
      }

      const saveRes = await saveDoctorSignature({ signatureKey: key });
      if (!saveRes?.success) {
        throw new Error(saveRes?.message || "Failed to update profile with signature.");
      }

      dispatch(setSignatureKey(key));
      const localUrl = URL.createObjectURL(fileToUpload);
      dispatch(setSignatureUrl(localUrl));

      toast.success("Digital signature saved successfully.");
      setIsEditingSignature(false);
      setSignaturePreview(null);
      setSignatureFile(null);
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving signature.");
      console.error(err);
    } finally {
      setUploadingSignature(false);
    }
  };
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const [licensePreview, setLicensePreview] = useState<PreviewFile | null>(
    null,
  );
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [degreePreview, setDegreePreview] = useState<PreviewFile | null>(null);
  const [degreeError, setDegreeError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  const MAX_SIZE_MB = 5;

  function validateFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only PDF, JPG, and PNG files are allowed.";
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return "File size must be less than 5 MB.";
    }

    return null;
  }

  function handleFile(file: File, type: "license" | "degree") {
    const validationError = validateFile(file);
    if (validationError) {
      if (type === "license") {
        setLicenseError(validationError);
      } else {
        setDegreeError(validationError);
      }
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    if (type === "license") {
      setLicensePreview({
        file,
        previewUrl,
        type: file.type === "application/pdf" ? "pdf" : "image",
      });
    } else {
      setDegreePreview({
        file,
        previewUrl,
        type: file.type === "application/pdf" ? "pdf" : "image",
      });
    }
    if (type === "license") {
      setLicenseError(null);
    } else {
      setDegreeError(null);
    }
  }

  function getFormattedSizeFromBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    bytes = bytes / 1024;
    if (bytes > 1024) {
      bytes = bytes / 1024;
      return bytes.toFixed(2) + " MB";
    }
    return bytes.toFixed(2) + " KB";
  }

  async function handleUpload() {
    if (!licensePreview && !degreePreview) {
      errorRef.current?.classList.remove("hidden");
      return;
    }
    setSaveLoading(true);
    errorRef.current?.classList.add("hidden");

    let medicalLicenseKey = null;
    let medicalLicenseUploadSignedUrl = null;
    let degreeCertificateKey = null;
    let degreeCertificateUploadSignedUrl = null;

    try {
      if (licensePreview) {
        const licenseRes = await getMedicalLicenseUploadSignedUrl({
          doctorId: userInfo.id,
          filename: licensePreview.file.name,
          contentType: licensePreview.file.type,
        });
        medicalLicenseUploadSignedUrl = licenseRes.data.uploadUrl;
        medicalLicenseKey = licenseRes.data.key;
      }
      if (degreePreview) {
        const degreeRes = await getDegreeCertificateUploadSignedUrl({
          doctorId: userInfo.id,
          filename: degreePreview.file.name,
          contentType: degreePreview.file.type,
        });
        degreeCertificateUploadSignedUrl = degreeRes.data.uploadUrl;
        degreeCertificateKey = degreeRes.data.key;
      }
    } catch (err) {
      toast.error("An error has occurred. Please try again.");
      console.log(err);
      setSaveLoading(false);
      return;
    }
    if (medicalLicenseUploadSignedUrl || degreeCertificateUploadSignedUrl) {
      try {
        const saveData = {
          medicalLicenseKey: null,
          degreeCertificateKey: null,
        };
        if (licensePreview && medicalLicenseUploadSignedUrl) {
          const licenseUploadResponse = await uploadFileToS3(
            medicalLicenseUploadSignedUrl,
            licensePreview.file,
            licensePreview.file.type,
          );
          if (licenseUploadResponse?.success) {
            saveData.medicalLicenseKey = medicalLicenseKey;
          }
        }
        if (degreePreview && degreeCertificateUploadSignedUrl) {
          const degreeUploadResponse = await uploadFileToS3(
            degreeCertificateUploadSignedUrl,
            degreePreview.file,
            degreePreview.file.type,
          );
          if (degreeUploadResponse?.success) {
            saveData.degreeCertificateKey = degreeCertificateKey;
          }
        }
        if (saveData.medicalLicenseKey || saveData.degreeCertificateKey) {
          const saveResponse = await saveDoctorVerificationDocs(saveData);
          if (saveResponse?.success) {
            dispatch(
              setCertificates({
                medicalLicense: saveResponse.data.medicalLicense,
                latestDegree: saveResponse.data.latestDegree,
              }),
            );
            toast.success("Files uploaded successfully.");
            setLicensePreview(null);
            setDegreePreview(null);
            setSaveLoading(false);
          } else {
            toast.error("An error has occurred. Please try again.");
            setSaveLoading(false);
            return;
          }
        } else {
          toast.error("An error has occurred. Please try again.");
          setSaveLoading(false);
          return;
        }
      } catch (err) {
        toast.error("Upload failed.");
        setSaveLoading(false);
        return;
      }
    }
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm p-6"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {/* <span className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {getIcon("document", "16px")}
            </span> */}
            Verification Documents
          </h2>
          {verificationStatus !== "rejected" && (
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full border border-blue-100 dark:border-blue-800/50 uppercase tracking-wider">
              Read-only
            </span>
          )}
        </div>

        {verificationStatus !== "rejected" && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 flex gap-2.5 items-start">
            <div className="text-amber-500 mt-0.5">
              {getIcon("info", "16px")}
            </div>
            <p className="text-amber-800 dark:text-amber-300 text-xs leading-normal">
              Documents are currently locked. Contact support to update verified
              credentials.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medical License */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between group p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-400 group-hover:text-darkGreen dark:group-hover:text-lightGreen transition-colors">
                  {getIcon("id-card", "20px")}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    Medical License
                  </p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Verification Proof
                  </p>
                </div>
              </div>
              {certificates.medicalLicense && (
                <a
                  href={certificates.medicalLicense}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all text-darkGreen dark:text-lightGreen shadow-sm"
                  title="View Document"
                >
                  {getIcon("external-link", "16px")}
                </a>
              )}
            </div>

            {verificationStatus === "rejected" && (
              <div
                className="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center justify-center text-center group cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file, "license");
                }}
                onClick={() => document.getElementById("licenseInput")?.click()}
              >
                {licensePreview ? (
                  <div className="w-full">
                    {licensePreview.type === "image" ? (
                      <img
                        src={licensePreview.previewUrl}
                        alt="Preview"
                        className="max-h-28 mx-auto rounded-lg object-contain mb-3 shadow-sm"
                      />
                    ) : (
                      <div className="w-full p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 mb-3 flex items-center justify-center gap-2">
                        {getIcon("file-pdf", "24px", "red")}
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                          PDF Preview
                        </span>
                      </div>
                    )}
                    <p className="font-bold text-xs text-darkGreen dark:text-lightGreen truncate max-w-full px-2 mb-1">
                      {licensePreview.file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">
                      {getFormattedSizeFromBytes(licensePreview.file.size)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        URL.revokeObjectURL(licensePreview.previewUrl);
                        setLicensePreview(null);
                      }}
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-bold text-[10px] hover:bg-red-100 transition-colors"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm mb-3 text-slate-400 group-hover:scale-110 transition-transform">
                      {getIcon("upload", "18px")}
                    </div>
                    <p className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-0.5">
                      Upload New License
                    </p>
                    <p className="text-slate-400 text-[10px] font-medium tracking-tight">
                      Drag & drop or click
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  hidden
                  id="licenseInput"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file, "license");
                  }}
                />
              </div>
            )}
            {licenseError && (
              <p className="text-red-500 text-[10px] font-bold mt-1 pl-2">
                {licenseError}
              </p>
            )}
          </div>

          {/* Degree Certificate */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between group p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-slate-400 group-hover:text-darkGreen dark:group-hover:text-lightGreen transition-colors">
                  {getIcon("graduation-cap", "20px")}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    Degree Certificate
                  </p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    Educational Proof
                  </p>
                </div>
              </div>
              {certificates.latestDegree && (
                <a
                  href={certificates.latestDegree}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all text-darkGreen dark:text-lightGreen shadow-sm"
                  title="View Document"
                >
                  {getIcon("external-link", "16px")}
                </a>
              )}
            </div>

            {verificationStatus === "rejected" && (
              <div
                className="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center justify-center text-center group cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFile(file, "degree");
                }}
                onClick={() => document.getElementById("degreeInput")?.click()}
              >
                {degreePreview ? (
                  <div className="w-full">
                    {degreePreview.type === "image" ? (
                      <img
                        src={degreePreview.previewUrl}
                        alt="Preview"
                        className="max-h-28 mx-auto rounded-lg object-contain mb-3 shadow-sm"
                      />
                    ) : (
                      <div className="w-full p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 mb-3 flex items-center justify-center gap-2">
                        {getIcon("file-pdf", "24px", "red")}
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                          PDF Preview
                        </span>
                      </div>
                    )}
                    <p className="font-bold text-xs text-darkGreen dark:text-lightGreen truncate max-w-full px-2 mb-1">
                      {degreePreview.file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-3">
                      {getFormattedSizeFromBytes(degreePreview.file.size)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        URL.revokeObjectURL(degreePreview.previewUrl);
                        setDegreePreview(null);
                      }}
                      className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-bold text-[10px] hover:bg-red-100 transition-colors"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm mb-3 text-slate-400 group-hover:scale-110 transition-transform">
                      {getIcon("upload", "18px")}
                    </div>
                    <p className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-0.5">
                      Upload New Certificate
                    </p>
                    <p className="text-slate-400 text-[10px] font-medium tracking-tight">
                      Drag & drop or click
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  hidden
                  id="degreeInput"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file, "degree");
                  }}
                />
              </div>
            )}
            {degreeError && (
              <p className="text-red-500 text-[10px] font-bold mt-1 pl-2">
                {degreeError}
              </p>
            )}
          </div>
        </div>

        {verificationStatus === "rejected" && (
          <div className="flex flex-col items-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div
              ref={errorRef}
              className="hidden text-red-500 text-[10px] font-bold items-center gap-1"
            >
              {getIcon("error", "12px")}
              No documents selected for upload.
            </div>
            <button
              className="px-6 py-2.5 bg-darkGreen dark:bg-emerald-600 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all transform active:scale-95 shadow-md shadow-darkGreen/10 text-xs"
              onClick={() => handleUpload()}
              disabled={saveLoading}
            >
              {saveLoading ? (
                <LoadingCircle />
              ) : (
                getIcon("save", "16px", "white")
              )}
              {saveLoading ? "Uploading Files..." : "Upload & Save Changes"}
            </button>
          </div>
        )}

        {/* Digital Signature Section */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            {getIcon("edit", "18px")}
            Digital Signature
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
            This signature will be appended to your issued prescriptions. Please upload a clear image of your signature or draw it below.
          </p>

          {signatureUrl && !isEditingSignature ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-xs w-full flex justify-center items-center">
                <img
                  src={signatureUrl}
                  alt="Doctor Signature"
                  className="max-h-24 object-contain"
                />
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Signature Active
                </p>
                <p className="text-xs text-slate-400">
                  Your signature is successfully saved and will be used on new prescriptions.
                </p>
                <button
                  type="button"
                  onClick={() => setIsEditingSignature(true)}
                  className="mt-2 px-4 py-2 bg-lightGreen/10 hover:bg-lightGreen/20 text-darkGreen dark:text-lightGreen rounded-xl font-bold transition-all active:scale-95 text-xs w-fit"
                >
                  Update Signature
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("upload");
                    setSignaturePreview(null);
                    setSignatureFile(null);
                  }}
                  className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-colors ${
                    activeTab === "upload"
                      ? "border-darkGreen dark:border-lightGreen text-darkGreen dark:text-lightGreen"
                      : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("draw");
                    setSignaturePreview(null);
                    setSignatureFile(null);
                  }}
                  className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-colors ${
                    activeTab === "draw"
                      ? "border-darkGreen dark:border-lightGreen text-darkGreen dark:text-lightGreen"
                      : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}
                >
                  Draw Signature
                </button>
              </div>

              {activeTab === "upload" ? (
                <div className="flex flex-col gap-3">
                  <div
                    className="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center justify-center text-center group cursor-pointer"
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
                    onClick={() => document.getElementById("signatureInput")?.click()}
                  >
                    {signaturePreview ? (
                      <div>
                        <img
                          src={signaturePreview}
                          alt="Signature Preview"
                          className="max-h-24 mx-auto rounded-lg object-contain mb-3 bg-white p-2 border border-slate-200 shadow-sm"
                        />
                        <p className="font-bold text-xs text-darkGreen dark:text-lightGreen truncate max-w-full px-2 mb-1">
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
                          className="mt-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-bold text-[10px] hover:bg-red-100 transition-colors"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm mb-3 text-slate-400 group-hover:scale-110 transition-transform">
                          {getIcon("upload", "18px")}
                        </div>
                        <p className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-0.5">
                          Upload Signature Image
                        </p>
                        <p className="text-slate-400 text-[10px] font-medium tracking-tight">
                          Supports PNG, JPG, JPEG up to 2MB
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      id="signatureInput"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSignatureFile(file);
                          setSignaturePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-inner overflow-hidden max-w-full w-[450px]">
                    <canvas
                      ref={canvasRef}
                      width={448}
                      height={180}
                      className="cursor-crosshair w-full block bg-white touch-none"
                      style={{ touchAction: "none" }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold transition-all text-xs"
                    >
                      Clear Canvas
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                {signatureUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingSignature(false);
                      setSignaturePreview(null);
                      setSignatureFile(null);
                    }}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveSignature}
                  disabled={uploadingSignature}
                  className="px-6 py-2.5 bg-darkGreen dark:bg-emerald-600 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all transform active:scale-95 shadow-md shadow-darkGreen/10 text-xs"
                >
                  {uploadingSignature ? (
                    <LoadingCircle />
                  ) : (
                    getIcon("save", "16px", "white")
                  )}
                  {uploadingSignature ? "Saving..." : "Save Signature"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default DProfileDocuments;
