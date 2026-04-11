import getIcon from "../../../helpers/getIcon";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import { useRef, useState } from "react";
import {
  getDegreeCertificateUploadSignedUrl,
  getMedicalLicenseUploadSignedUrl,
  saveDoctorVerificationDocs,
} from "../../../api/doctor/dProfileCreationService";
import toast from "react-hot-toast";
import { uploadFileToS3 } from "../../../api/s3Service";
import LoadingCircle from "../../common/LoadingCircle";
import { setCertificates } from "../../../state/doctor/dProfileCreationSlice";
import { motion } from "framer-motion";

type PreviewFile = {
  file: File;
  previewUrl: string;
  type: "image" | "pdf";
};

function DProfileDocuments() {
  const { certificates, verificationStatus } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  const dispatch = useDispatch();
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
            <span className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {getIcon("document", "16px")}
            </span>
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
      </div>
    </motion.div>
  );
}

export default DProfileDocuments;
