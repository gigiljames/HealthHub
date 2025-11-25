import { FaCloudUploadAlt } from "react-icons/fa";
import { useDropzone } from "react-dropzone";

interface ProfileCreationUploadProps {
  title: string | "Upload documents";
  previewUrl?: string | null;
  fileName?: string | null;
  fileSizeBytes?: number | null;
  isPdf?: boolean;
  isUploading?: boolean;
  onDrop: (file: File) => void;
  onView?: () => void;
  onRemove?: () => void;
}

function ProfileCreationUpload({
  title,
  previewUrl,
  fileName,
  fileSizeBytes,
  isPdf,
  isUploading,
  onDrop,
  onView,
  onRemove,
}: ProfileCreationUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
    },
    onDrop: (acceptedFiles) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      onDrop(file);
    },
  });

  const hasFile = Boolean(previewUrl || fileName);
  const sizeLabel =
    typeof fileSizeBytes === "number"
      ? `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : null;

  return (
    <>
      <div className="flex flex-col gap-1.5 w-full">
        <p className="text-[#717171] text-sm font-semibold">{title}</p>
        <div
          {...getRootProps()}
          className={`bg-[#D8D8D8] rounded-md flex flex-col justify-center items-center p-6 cursor-pointer border-2 border-dashed transition-colors ${
            isDragActive
              ? "border-darkGreen bg-[#c5e8d5]"
              : "border-transparent"
          }`}
        >
          <input {...getInputProps()} />
          {hasFile ? (
            <>
              {previewUrl && !isPdf ? (
                <img
                  src={previewUrl}
                  alt={fileName || "Selected file"}
                  className="max-h-40 object-contain mb-2 rounded-md"
                />
              ) : (
                <FaCloudUploadAlt size={"80px"} color="#222222" />
              )}
              <p className="text-[#222222] text-sm font-semibold text-center break-all">
                {fileName}
              </p>
              {sizeLabel && (
                <p className="text-[#555555] text-xs font-medium mt-0.5">
                  {sizeLabel}
                </p>
              )}
            </>
          ) : (
            <>
              <FaCloudUploadAlt size={"120px"} color="#222222" />
              <p className="text-[#8F8F8F] text-sm font-semibold mt-1 text-center">
                Drag & drop or Click to Browse
              </p>
            </>
          )}
          {isUploading && (
            <p className="text-xs text-darkGreen font-semibold mt-2">
              Uploading...
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          {onView && hasFile && (
            <button
              type="button"
              className="bg-darkGreen text-white text-xs px-3 py-1.5 rounded-lg hover:-translate-y-0.5 transition-all"
              onClick={onView}
            >
              View
            </button>
          )}
          {onRemove && hasFile && (
            <button
              type="button"
              className="bg-red-400 text-white text-xs px-3 py-1.5 rounded-lg hover:-translate-y-0.5 transition-all"
              onClick={onRemove}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default ProfileCreationUpload;
