import { useRef, useState } from "react";
import getIcon from "../../../helpers/getIcon";
import toast from "react-hot-toast";
import LoadingCircle from "../../common/LoadingCircle";
import {
  getDegreeCertificateUploadSignedUrl,
  getMedicalLicenseUploadSignedUrl,
  saveDoctorVerificationDocs,
} from "../../../api/doctor/dProfileCreationService";
import { uploadFileToS3 } from "../../../api/s3Service";
import { useSelector } from "react-redux";
import type { RootState } from "../../../state/store";

interface DOnboardingStep5Props {
  setStep: (step: number) => void;
}

type PreviewFile = {
  file: File;
  previewUrl: string;
  type: "image" | "pdf";
};

function DOnboardingStep5({ setStep }: DOnboardingStep5Props) {
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
    if (!licensePreview || !degreePreview) {
      errorRef.current?.classList.remove("hidden");
      return;
    }
    setSaveLoading(true);
    errorRef.current?.classList.add("hidden");
    const formData = new FormData();
    formData.append("license", licensePreview.file);
    formData.append("degree", degreePreview.file);
    // get signed url here
    let medicalLicenseKey = "";
    let medicalLicenseUploadSignedUrl = "";
    let degreeCertificateKey = "";
    let degreeCertificateUploadSignedUrl = "";

    try {
      const licenseRes = await getMedicalLicenseUploadSignedUrl({
        doctorId: userInfo.id,
        filename: licensePreview.file.name,
        contentType: licensePreview.file.type,
      });
      medicalLicenseUploadSignedUrl = licenseRes.data.uploadUrl;
      medicalLicenseKey = licenseRes.data.key;
      const degreeRes = await getDegreeCertificateUploadSignedUrl({
        doctorId: userInfo.id,
        filename: degreePreview.file.name,
        contentType: degreePreview.file.type,
      });
      degreeCertificateUploadSignedUrl = degreeRes.data.uploadUrl;
      degreeCertificateKey = degreeRes.data.key;
    } catch (err) {
      toast.error("An error has occurred. Please try again.");
      console.log(err);
      setSaveLoading(false);
      return;
    }
    if (medicalLicenseUploadSignedUrl && degreeCertificateUploadSignedUrl) {
      try {
        const licenseUploadResponse = await uploadFileToS3(
          medicalLicenseUploadSignedUrl,
          licensePreview.file,
          licensePreview.file.type,
        );
        const degreeUploadResponse = await uploadFileToS3(
          degreeCertificateUploadSignedUrl,
          degreePreview.file,
          degreePreview.file.type,
        );
        if (licenseUploadResponse?.success && degreeUploadResponse?.success) {
          const saveResponse = await saveDoctorVerificationDocs({
            medicalLicenseKey,
            degreeCertificateKey,
          });
          if (saveResponse?.success) {
            toast.success("Onboarding step 5 completed successfully.");
            setSaveLoading(false);
            setStep(6);
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
    <>
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="max-w-3xl flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Verify your profile</h1>
          <p className="text-gray-500">
            We need to verify your credentials before you can start accepting
            appointments. Your data is processed securely.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div
            className="bg-white border-dashed border-2 border-gray-200 flex flex-col gap-2 w-full p-3 justify-center items-center rounded-xl py-12"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file, "license");
            }}
          >
            {licensePreview ? (
              <div className="flex flex-col gap-2 items-center justify-center">
                {licensePreview.type === "image" ? (
                  <img
                    src={licensePreview.previewUrl}
                    alt="Document preview"
                    className="max-h-50 rounded-md object-contain"
                  />
                ) : (
                  <iframe
                    src={licensePreview.previewUrl}
                    title="PDF Preview"
                    className=" w-full rounded-md"
                  />
                )}
                <p className="font-medium">Medical License</p>
                <p className="text-darkGreen font-semibold text-center text-sm lg:text-sm">
                  {licensePreview.file.name}
                </p>
                <p className="text-gray-700 font-medium text-xs lg:text-sm">
                  {getFormattedSizeFromBytes(licensePreview.file.size)}
                </p>
                <div className="preview-actions">
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(licensePreview.previewUrl);
                      setLicensePreview(null);
                    }}
                    className="p-2 px-4 text-gray-500 bg-gray-200 hover:bg-gray-300 hover:text-gray-600 cursor-pointer rounded-md text-xs lg:text-sm mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gray-200 text-gray-500 rounded-full">
                  {getIcon("id-card", "30px")}
                </div>
                <p className="font-medium">Medical License</p>
                <div className="flex flex-col justify-center items-center">
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Drag & drop or browse
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    PDF or Image (max. 5MB)
                  </p>
                </div>
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
                <label
                  className="p-2 text-gray-500 bg-gray-200 hover:bg-gray-300 hover:text-gray-600 cursor-pointer rounded-md text-xs lg:text-sm"
                  htmlFor="licenseInput"
                >
                  Browse Files
                </label>
                <div className="text-red-500 text-xs lg:text-sm font-semibold">
                  {licenseError}
                </div>
              </>
            )}
          </div>
          <div
            className="bg-white border-dashed border-2 border-gray-200 flex flex-col gap-2 w-full p-3 justify-center items-center rounded-xl py-12"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file, "degree");
            }}
          >
            {degreePreview ? (
              <div className="flex flex-col gap-2 items-center justify-center">
                {degreePreview.type === "image" ? (
                  <img
                    src={degreePreview.previewUrl}
                    alt="Document preview"
                    className="max-h-50 rounded-md object-contain"
                  />
                ) : (
                  <iframe
                    src={degreePreview.previewUrl}
                    title="PDF Preview"
                    className=" w-full rounded-md"
                  />
                )}
                <p className="font-medium">Latest degree certificate</p>
                <p className="text-darkGreen font-semibold text-center text-sm lg:text-sm">
                  {degreePreview.file.name}
                </p>
                <p className="text-gray-700 font-medium text-xs lg:text-sm">
                  {getFormattedSizeFromBytes(degreePreview.file.size)}
                </p>
                <div className="preview-actions">
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(degreePreview.previewUrl);
                      setDegreePreview(null);
                    }}
                    className="p-2 px-4 text-gray-500 bg-gray-200 hover:bg-gray-300 hover:text-gray-600 cursor-pointer rounded-md text-xs lg:text-sm mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gray-200 text-gray-500 rounded-full">
                  {getIcon("certificate", "30px")}
                </div>
                <p className="font-medium">Latest degree certificate</p>
                <div className="flex flex-col justify-center items-center">
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Drag & drop or browse
                  </p>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    PDF or Image (max. 5MB)
                  </p>
                </div>
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
                <label
                  className="p-2 text-gray-500 bg-gray-200 hover:bg-gray-300 hover:text-gray-600 cursor-pointer rounded-md text-xs lg:text-sm"
                  htmlFor="degreeInput"
                >
                  Browse Files
                </label>
                <div className="text-red-500 text-xs lg:text-sm font-semibold">
                  {degreeError}
                </div>
              </>
            )}
          </div>
        </div>
        <div
          ref={errorRef}
          className="hidden text-red-500 text-sm lg:text-base text-center"
        >
          Please add both documents.
        </div>
        <div className="bg-lightGreen/30 p-3 rounded-xl flex gap-2">
          <div className="text-darkGreen p-1">{getIcon("lock", "20px")}</div>
          <div className="flex flex-col gap-1">
            <p className="font-medium text-sm lg:text-base">
              Secure Verification
            </p>
            <p className="text-xs lg:text-sm text-gray-500">
              Your documents are securely stored using industry-standard
              protocols. We only use this information to verify your medical
              credentials.
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p
            className="pl-2 text-gray-400 hover:text-gray-600 hover:underline font-base cursor-pointer"
            onClick={() => setStep(4)}
          >
            Back
          </p>
          <button
            className="bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen px-20 py-2.5 text-gray-50 hover:text-white text-lg rounded-md font-medium border-1 border-lightGreen flex items-center gap-2"
            onClick={() => handleUpload()}
            disabled={saveLoading}
          >
            {saveLoading && <LoadingCircle />}
            {saveLoading ? "Uploading..." : "Upload & Continue"}
          </button>
        </div>
      </div>
    </>
  );
}

export default DOnboardingStep5;
