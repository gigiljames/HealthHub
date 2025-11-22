import { useEffect, useRef, useState } from "react";
import {
  getHospitalProfileStage3,
  saveHospitalProfileStage3,
  getHospitalRegistrationUploadSignedUrl,
  getHospitalGstUploadSignedUrl,
  uploadFileToS3,
} from "../../api/hospital/hProfileCreationService";
import toast from "react-hot-toast";
import LoadingCircle from "../common/LoadingCircle";
import ProfileCreationUpload from "../common/ProfileCreationUpload";
import type { RootState } from "../../state/store";
import { useDispatch, useSelector } from "react-redux";
import {
  setGstCertificate,
  setHospitalRegistration,
} from "../../state/hospital/hProfileCreationSlice";

interface HProfileCreationStage3Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function HProfileCreationStage3({ changeStage }: HProfileCreationStage3Props) {
  const [loading, setLoading] = useState(false);
  const [regUploading, setRegUploading] = useState(false);
  const [gstUploading, setGstUploading] = useState(false);
  const [regFile, setRegFile] = useState<File | null>(null);
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [regPreviewUrl, setRegPreviewUrl] = useState<string | null>(null);
  const [gstPreviewUrl, setGstPreviewUrl] = useState<string | null>(null);
  const [regFileName, setRegFileName] = useState<string | null>(null);
  const [gstFileName, setGstFileName] = useState<string | null>(null);
  const [regFileSize, setRegFileSize] = useState<number | null>(null);
  const [gstFileSize, setGstFileSize] = useState<number | null>(null);
  const [regIsPdf, setRegIsPdf] = useState<boolean>(false);
  const [gstIsPdf, setGstIsPdf] = useState<boolean>(false);
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const gstCertificate = useSelector(
    (state: RootState) => state.hProfileCreation.gstCertificate
  );
  const hospitalRegistration = useSelector(
    (state: RootState) => state.hProfileCreation.hospitalRegistration
  );
  const regErrorRef = useRef<HTMLDivElement | null>(null);
  const gstErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only hydrate from server if both certificate keys are empty
    if (gstCertificate || hospitalRegistration) return;

    (async () => {
      try {
        const response = await getHospitalProfileStage3();
        if (response?.success && response.data) {
          const data = response.data as {
            hospitalRegistration?: string;
            gstCertificate?: string;
          };
          if (typeof data.hospitalRegistration === "string") {
            dispatch(setHospitalRegistration(data.hospitalRegistration));
          }
          if (typeof data.gstCertificate === "string") {
            dispatch(setGstCertificate(data.gstCertificate));
          }
        }
      } catch {
        // ignore errors; form will remain empty
      }
    })();
  }, [dispatch, gstCertificate, hospitalRegistration]);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    msg: string
  ) => {
    if (ref.current) ref.current.innerHTML = msg;
  };

  const clearErrors = () => {
    [regErrorRef, gstErrorRef].forEach(
      (r) => r.current && (r.current.innerHTML = "")
    );
  };

  function handleBackClick() {
    changeStage((prev) => prev - 1);
  }

  async function handleNextClick() {
    clearErrors();

    let valid = true;

    // if (!hospitalRegistration || typeof hospitalRegistration !== "string") {
    //   valid = false;
    //   showError(
    //     regErrorRef,
    //     "Please upload hospital registration certificate."
    //   );
    // } else if (!hospitalRegistration.startsWith("uploads/")) {
    //   // simple check: must be valid S3 key format if using structured prefix
    //   valid = false;
    //   showError(
    //     regErrorRef,
    //     "Invalid file key for registration certificate. Please re-upload."
    //   );
    // }

    // if (!gstCertificate || typeof gstCertificate !== "string") {
    //   valid = false;
    //   showError(gstErrorRef, "Please upload GST certificate.");
    // } else if (!gstCertificate.startsWith("uploads/")) {
    //   valid = false;
    //   showError(
    //     gstErrorRef,
    //     "Invalid file key for GST certificate. Please re-upload."
    //   );
    // }

    // if (!valid) {
    //   toast.error("Please upload all required documents.");
    //   return;
    // }

    setLoading(true);
    try {
      // Upload pending files (if any) and get final keys
      let finalHospitalRegistration = hospitalRegistration || "";
      if (regFile) {
        const isImage = regFile.type.startsWith("image/");
        const isPdf = regFile.type === "application/pdf";
        if (!isImage && !isPdf) {
          throw new Error(
            "Only images and PDF files are allowed for registration."
          );
        }

        setRegUploading(true);
        const timestamp = Date.now();
        const safeName = regFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const fileName = `${timestamp}_${safeName}`;
        const uploadConfig = await getHospitalRegistrationUploadSignedUrl(
          fileName,
          regFile.type
        );

        if (
          !uploadConfig?.success ||
          !uploadConfig.uploadUrl ||
          !uploadConfig.key
        ) {
          throw new Error("Failed to get upload URL for registration.");
        }

        const uploadResult = await uploadFileToS3(
          uploadConfig.uploadUrl,
          regFile,
          regFile.type
        );

        if (!uploadResult?.success) {
          throw new Error("Upload to storage failed for registration.");
        }

        finalHospitalRegistration = uploadConfig.key as string;
        dispatch(setHospitalRegistration(finalHospitalRegistration));
      }

      let finalGstCertificate = gstCertificate || "";
      if (gstFile) {
        const isImage = gstFile.type.startsWith("image/");
        const isPdf = gstFile.type === "application/pdf";
        if (!isImage && !isPdf) {
          throw new Error("Only images and PDF files are allowed for GST.");
        }

        setGstUploading(true);
        const timestamp = Date.now();
        const safeName = gstFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const fileName = `${timestamp}_${safeName}`;
        const uploadConfig = await getHospitalGstUploadSignedUrl(
          fileName,
          gstFile.type
        );

        if (
          !uploadConfig?.success ||
          !uploadConfig.uploadUrl ||
          !uploadConfig.key
        ) {
          throw new Error("Failed to get upload URL for GST.");
        }

        const uploadResult = await uploadFileToS3(
          uploadConfig.uploadUrl,
          gstFile,
          gstFile.type
        );

        if (!uploadResult?.success) {
          throw new Error("Upload to storage failed for GST.");
        }

        finalGstCertificate = uploadConfig.key as string;
        dispatch(setGstCertificate(finalGstCertificate));
      }

      const stage3Data = {
        hospitalId: userInfo.id,
        gstCertificate: finalGstCertificate,
        hospitalRegistration: finalHospitalRegistration,
      };

      const data = await saveHospitalProfileStage3(stage3Data);
      setLoading(false);
      if (data.success) {
        toast.success(data?.message || "Saved successfully.");
        changeStage((prev) => prev + 1);
      } else {
        throw new Error("An error occurred while saving profile.");
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        (error as Error)?.message || "An error occurred while saving profile."
      );
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row w-full gap-3 mt-6 mb-3">
        <div className="flex flex-col w-full">
          <ProfileCreationUpload
            title="Upload hospital registration certificate"
            previewUrl={regPreviewUrl}
            fileName={
              regFileName ||
              (hospitalRegistration
                ? hospitalRegistration.split("/").pop() || null
                : null)
            }
            fileSizeBytes={regFileSize}
            isPdf={
              regIsPdf ||
              (!!hospitalRegistration && hospitalRegistration.endsWith(".pdf"))
            }
            isUploading={regUploading}
            onDrop={(file) => {
              const isImage = file.type.startsWith("image/");
              const isPdf = file.type === "application/pdf";

              if (!isImage && !isPdf) {
                toast.error("Only images and PDF files are allowed.");
                return;
              }

              const objectUrl = isImage ? URL.createObjectURL(file) : null;
              setRegFile(file);
              setRegPreviewUrl(objectUrl);
              setRegFileName(file.name);
              setRegFileSize(file.size);
              setRegIsPdf(isPdf);
            }}
            onView={() => {
              if (regPreviewUrl) {
                window.open(regPreviewUrl, "_blank");
              } else {
                toast.error("Preview not available for this file.");
              }
            }}
            onRemove={() => {
              setRegFile(null);
              setRegPreviewUrl(null);
              setRegFileName(null);
              setRegFileSize(null);
              setRegIsPdf(false);
              dispatch(setHospitalRegistration(""));
            }}
          />
          <div className="error-container" ref={regErrorRef}></div>
        </div>

        <div className="flex flex-col w-full">
          <ProfileCreationUpload
            title="Upload GST certificate"
            previewUrl={gstPreviewUrl}
            fileName={
              gstFileName ||
              (gstCertificate ? gstCertificate.split("/").pop() || null : null)
            }
            fileSizeBytes={gstFileSize}
            isPdf={
              gstIsPdf || (!!gstCertificate && gstCertificate.endsWith(".pdf"))
            }
            isUploading={gstUploading}
            onDrop={(file) => {
              const isImage = file.type.startsWith("image/");
              const isPdf = file.type === "application/pdf";

              if (!isImage && !isPdf) {
                toast.error("Only images and PDF files are allowed.");
                return;
              }

              const objectUrl = isImage ? URL.createObjectURL(file) : null;
              setGstFile(file);
              setGstPreviewUrl(objectUrl);
              setGstFileName(file.name);
              setGstFileSize(file.size);
              setGstIsPdf(isPdf);
            }}
            onView={() => {
              if (gstPreviewUrl) {
                window.open(gstPreviewUrl, "_blank");
              } else {
                toast.error("Preview not available for this file.");
              }
            }}
            onRemove={() => {
              setGstFile(null);
              setGstPreviewUrl(null);
              setGstFileName(null);
              setGstFileSize(null);
              setGstIsPdf(false);
              dispatch(setGstCertificate(""));
            }}
          />
          <div className="error-container" ref={gstErrorRef}></div>
        </div>
      </div>

      <div className="flex gap-2 lg:gap-4 justify-end">
        <button
          className="flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-inputBorder hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-[50px]"
          onClick={handleBackClick}
        >
          Back
        </button>
        <button
          className="flex justify-center items-center font-medium px-7 lg:px-10 py-2.5 mt-2 text-white rounded-xl bg-darkGreen hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-[50px]"
          onClick={handleNextClick}
        >
          {loading ? (
            <>
              <LoadingCircle />
              Loading...
            </>
          ) : (
            "Next"
          )}
        </button>
      </div>
    </>
  );
}

export default HProfileCreationStage3;
