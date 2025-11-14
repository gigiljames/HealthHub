import { useEffect, useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import LoadingCircle from "../common/LoadingCircle";
import ProfileCreationInput from "../common/ProfileCreationInput";
import {
  getS3UploadUrl,
  saveHospitalProfileStage1,
  uploadFileToS3,
} from "../../api/hospital/hProfileCreationService";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import {
  setAbout,
  setEstablishedYear,
  setName,
  setType,
  setProfileImage,
} from "../../state/hospital/hProfileCreationSlice";

interface HProfileCreationStage1Props {
  changeStage: React.Dispatch<React.SetStateAction<number>>;
}

function HProfileCreationStage1({ changeStage }: HProfileCreationStage1Props) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [blobImage, setBlobImage] = useState<Blob>();
  const [image, setImage] = useState();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const name = useSelector((state: RootState) => state.hProfileCreation.name);
  const establishedYear = useSelector(
    (state: RootState) => state.hProfileCreation.establishedYear
  );
  const type = useSelector((state: RootState) => state.hProfileCreation.type);
  const about = useSelector((state: RootState) => state.hProfileCreation.about);
  const profileImage = useSelector(
    (state: RootState) => state.hProfileCreation.profileImage
  );
  const dispatch = useDispatch();
  const nameErrorRef = useRef<HTMLDivElement | null>(null);
  const typeErrorRef = useRef<HTMLDivElement | null>(null);
  const establishedYearErrorRef = useRef<HTMLDivElement | null>(null);
  const aboutErrorRef = useRef<HTMLDivElement | null>(null);
  const nameRegex = /^[A-Za-z0-9\s\-.'(),]{2,100}$/;

  useEffect(() => {
    dispatch(setName(userInfo.name));
  }, [dispatch, userInfo.name]);

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };
  const removeErrors = () => {
    [
      nameErrorRef,
      typeErrorRef,
      establishedYearErrorRef,
      aboutErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string);
      setCropMode(true);
    });
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any
  ): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const maxSize = Math.max(pixelCrop.width, pixelCrop.height);
    canvas.width = maxSize;
    canvas.height = maxSize;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      maxSize,
      maxSize
    );
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Canvas toBlob() failed"));
        },
        "image/jpeg",
        0.95
      );
    });
    setBlobImage(blob);
    return canvas.toDataURL("image/jpeg");
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setUploading(true);
      const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
      setImage(croppedImg);
      const response = await getS3UploadUrl(
        "filename",
        "image/jpeg",
        "uploads/hospital-profile-images"
      );
      dispatch(setProfileImage(response.key));
      const uploadResponse = await uploadFileToS3(
        response.uploadUrl,
        blobImage!,
        "image/jpeg"
      );
      setCropMode(false);
      setImageSrc(null);
    } catch (e) {
      toast.error("Failed to crop image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = () => {
    setImage("");
    setImageSrc(null);
    setCropMode(false);
  };

  async function handleNextClick() {
    removeErrors();
    let valid = true;

    if (!name || name.trim() === "") {
      valid = false;
      showError(nameErrorRef, "Enter hospital name.");
    } else if (!nameRegex.test(name)) {
      valid = false;
      showError(nameErrorRef, "Enter a valid hospital name (2-100 chars).");
    }

    if (!type || type.trim() === "") {
      valid = false;
      showError(typeErrorRef, "Enter hospital type.");
    } else if (type.length < 2) {
      valid = false;
      showError(typeErrorRef, "Enter a valid type.");
    }

    const currentYear = new Date().getFullYear();
    let yearValue: number | null = null;
    if (!establishedYear) {
      valid = false;
      showError(establishedYearErrorRef, "Enter established year.");
    } else {
      const parsed = Number(establishedYear);
      if (Number.isNaN(parsed) || !Number.isInteger(parsed)) {
        valid = false;
        showError(establishedYearErrorRef, "Enter a valid year.");
      } else {
        yearValue = parsed;
        if (parsed < 1800 || parsed > currentYear) {
          valid = false;
          showError(
            establishedYearErrorRef,
            `Enter a year between 1800 and ${currentYear}.`
          );
        }
      }
    }

    if (!about || about.trim() === "") {
      valid = false;
      showError(
        aboutErrorRef,
        "Provide a short description about the hospital."
      );
    } else if (about.trim().length < 10) {
      valid = false;
      showError(aboutErrorRef, "About must be at least 10 characters.");
    }

    if (!valid) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    const stage1Data = {
      hospitalId: userInfo.id.toString(),
      type,
      establishedYear: yearValue ?? establishedYear,
      about,
      profileImage,
    };

    setLoading(true);
    try {
      const data = await saveHospitalProfileStage1(stage1Data);
      setLoading(false);
      if (data?.success) {
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
      <div className="flex flex-col lg:flex-row pt-7 gap-4">
        <div className="flex flex-col items-center justify-start w-full md:w-[250px]">
          <div className="w-[150px] h-[150px] rounded-xl border-2 border-inputBorder flex items-center justify-center overflow-hidden bg-gray-50">
            {image ? (
              <img
                src={image}
                alt="Profile Preview"
                className="object-cover w-full h-full rounded-xl"
              />
            ) : (
              <span className="text-gray-400 text-sm">No Image</span>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="bg-darkGreen text-white text-sm px-3 py-1.5 rounded-lg hover:-translate-y-0.5 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload
            </button>
            {image && (
              <button
                className="bg-red-400 text-white text-sm px-3 py-1.5 rounded-lg hover:-translate-y-0.5 transition-all"
                onClick={handleDeleteImage}
              >
                Delete
              </button>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={onSelectFile}
          />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <ProfileCreationInput
            title="Name of Hospital"
            placeholder="Enter name of hospital"
            changeState={(name) => dispatch(setName(name as string))}
            value={name}
          />
          <div className="error-container" ref={nameErrorRef}></div>
          <ProfileCreationInput
            title="Registered email"
            disabled={true}
            value="example@gmail.com"
          />
        </div>
      </div>

      {cropMode && imageSrc && (
        <div className="fixed inset-0 bg-black/70 flex flex-col justify-center items-center z-50">
          <div className="relative bg-white rounded-xl p-4 flex flex-col items-center">
            <div className="w-[300px] h-[300px] relative bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                className="bg-darkGreen text-white px-4 py-2 rounded-lg"
                onClick={handleCropSave}
              >
                {uploading ? (
                  <>
                    Processing...
                    <LoadingCircle />
                  </>
                ) : (
                  "Save"
                )}
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg"
                onClick={() => setCropMode(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 pb-3 pt-2">
        <div>
          <ProfileCreationInput
            title="Type"
            placeholder="Enter type of hospital"
            value={type}
            changeState={(type) => dispatch(setType(type as string))}
          />
          <div className="error-container" ref={typeErrorRef}></div>
        </div>

        <div>
          <ProfileCreationInput
            title="Established Year"
            type="number"
            placeholder="Enter established year"
            value={establishedYear ?? ""}
            changeState={(year) => {
              const num = Number(year);
              dispatch(
                setEstablishedYear(Number.isNaN(num) ? (year as any) : num)
              );
            }}
          />
          <div className="error-container" ref={establishedYearErrorRef}></div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
          About
        </p>
        <div className="flex flex-col relative w-full mb-1.5 p-1 bg-white rounded-lg border-1 border-inputBorder">
          <textarea
            className="p-2 peer text-sm md:text-[16px] md:min-w-[200px] lg:min-w-[400px] h-[50px] bg-white min-h-40"
            onChange={(e) => dispatch(setAbout(e.target.value))}
            value={about}
          ></textarea>
        </div>
        <div className="error-container" ref={aboutErrorRef}></div>
      </div>

      <div className="flex gap-2 lg:gap-4 justify-end">
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

export default HProfileCreationStage1;
