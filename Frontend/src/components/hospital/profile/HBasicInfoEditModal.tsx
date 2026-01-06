import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import {
  setName,
  setType,
  setEstablishedYear,
  setAbout,
} from "../../../state/hospital/hProfileCreationSlice";
import { saveHospitalProfileStage1 } from "../../../api/hospital/hProfileCreationService";
import toast from "react-hot-toast";
import getIcon from "../../../helpers/getIcon";
import ProfileCreationInput from "../../common/ProfileCreationInput";
import LoadingCircle from "../../common/LoadingCircle";

interface HBasicInfoEditModalProps {
  closeModal: () => void;
}

function HBasicInfoEditModal({ closeModal }: HBasicInfoEditModalProps) {
  const dispatch = useDispatch();
  const { name, type, establishedYear, about } = useSelector(
    (state: RootState) => state.hProfileCreation
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);

  const [formData, setFormData] = useState({
    name: name || "",
    type: type || "",
    establishedYear: establishedYear || "",
    about: about || "",
  });

  const [loading, setLoading] = useState(false);

  const nameErrorRef = useRef<HTMLDivElement | null>(null);
  const typeErrorRef = useRef<HTMLDivElement | null>(null);
  const establishedYearErrorRef = useRef<HTMLDivElement | null>(null);
  const aboutErrorRef = useRef<HTMLDivElement | null>(null);

  const nameRegex = /^[A-Za-z0-9\s\-.'(),]{2,100}$/;

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

  async function handleSave() {
    removeErrors();
    let valid = true;

    if (!formData.name || formData.name.trim() === "") {
      valid = false;
      showError(nameErrorRef, "Enter hospital name.");
    } else if (!nameRegex.test(formData.name)) {
      valid = false;
      showError(nameErrorRef, "Enter a valid hospital name (2-100 chars).");
    }

    if (!formData.type || formData.type.trim() === "") {
      valid = false;
      showError(typeErrorRef, "Enter hospital type.");
    } else if (formData.type.length < 2) {
      valid = false;
      showError(typeErrorRef, "Enter a valid type.");
    }

    const currentYear = new Date().getFullYear();
    let yearValue: number | null = null;
    if (!formData.establishedYear) {
      valid = false;
      showError(establishedYearErrorRef, "Enter established year.");
    } else {
      const parsed = Number(formData.establishedYear);
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

    if (!formData.about || formData.about.trim() === "") {
      valid = false;
      showError(
        aboutErrorRef,
        "Provide a short description about the hospital."
      );
    } else if (formData.about.trim().length < 10) {
      valid = false;
      showError(aboutErrorRef, "About must be at least 10 characters.");
    }

    if (!valid) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    const payload = {
      hospitalId: userInfo.id.toString(),
      name: formData.name,
      type: formData.type,
      establishedYear: yearValue ?? formData.establishedYear,
      about: formData.about,
    };

    setLoading(true);
    try {
      const data = await saveHospitalProfileStage1(payload);
      if (data?.success) {
        dispatch(setName(formData.name));
        dispatch(setType(formData.type));
        dispatch(setEstablishedYear(yearValue ?? formData.establishedYear));
        dispatch(setAbout(formData.about));
        toast.success(data?.message || "Profile updated successfully.");
        closeModal();
      } else {
        throw new Error("An error occurred while saving profile.");
      }
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occurred while saving profile."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Edit Basic Information
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {getIcon("close", "24px", "black")}
          </button>
        </div>

        <div className="flex flex-col gap-x-6 gap-y-4">
          <div>
            <ProfileCreationInput
              title="Hospital Name"
              placeholder="Enter hospital name"
              value={formData.name}
              changeState={(val) =>
                setFormData({ ...formData, name: val as string })
              }
            />
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={nameErrorRef}
            ></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Type"
              placeholder="Enter type of hospital"
              value={formData.type}
              changeState={(val) =>
                setFormData({ ...formData, type: val as string })
              }
            />
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={typeErrorRef}
            ></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Established Year"
              type="number"
              placeholder="Enter established year"
              value={formData.establishedYear ?? ""}
              changeState={(val) => {
                const num = Number(val);
                setFormData({
                  ...formData,
                  establishedYear: Number.isNaN(num) ? (val as any) : num,
                });
              }}
            />
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={establishedYearErrorRef}
            ></div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              About
            </p>
            <div className="flex flex-col relative w-full mb-1.5 p-1 bg-white rounded-lg border-1 border-inputBorder">
              <textarea
                className="p-2 peer text-sm md:text-[16px] md:min-w-[200px] lg:min-w-[400px] h-[50px] bg-white min-h-30"
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
                value={formData.about}
              ></textarea>
            </div>
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={aboutErrorRef}
            ></div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-darkGreen text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading && <LoadingCircle />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HBasicInfoEditModal;
