import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import getIcon from "../../../helpers/getIcon";
import { saveDoctorProfileStage1 } from "../../../api/doctor/dProfileCreationService";
import {
  setName,
  setDob,
  setGender,
  setPhone,
  setAddress,
  setSpecialization,
  setAbout,
} from "../../../state/doctor/dProfileCreationSlice";
import type { RootState } from "../../../state/store";
import ProfileCreationInput from "../../common/ProfileCreationInput";
import { getSpecializationList } from "../../../api/doctor/dProfileCreationService";

interface DBasicInfoEditModalProps {
  closeModal: () => void;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

function DBasicInfoEditModal({ closeModal }: DBasicInfoEditModalProps) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const { name, dob, gender, phone, address, specialization, about } = useSelector(
    (state: RootState) => state.dProfileCreation,
  );
  const [formData, setFormData] = useState({
    name: name || "",
    dob: formatDate(dob),
    gender: gender || "",
    phone: phone || "",
    address: address || "",
    specialization: specialization || "",
    about: about || "",
  });
  const [loading, setLoading] = useState(false);
  const [specializationList, setSpecializationList] = useState<any[]>([]);
  const nameErrorRef = useRef<HTMLDivElement | null>(null);
  const dobErrorRef = useRef<HTMLDivElement | null>(null);
  const genderErrorRef = useRef<HTMLDivElement | null>(null);
  const phoneErrorRef = useRef<HTMLDivElement | null>(null);
  const addressErrorRef = useRef<HTMLDivElement | null>(null);
  const specializationErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getSpecializationList().then((response) => {
      console.log(response);
      if (response?.success) {
        setSpecializationList(response.specializations);
        const found = response.specializations.find(
          (spec: any) =>
            spec.name.toLowerCase() === specialization.toLowerCase() ||
            spec.id === specialization
        );
        if (found) {
          setFormData((prev) => ({ ...prev, specialization: found.id }));
        }
      }
    });
  }, [specialization]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string,
  ) => {
    if (ref.current) ref.current.innerHTML = message;
  };

  const removeErrors = () => {
    [
      nameErrorRef,
      dobErrorRef,
      genderErrorRef,
      phoneErrorRef,
      addressErrorRef,
      specializationErrorRef,
    ].forEach((r) => r.current && (r.current.innerHTML = ""));
  };

  const handleSave = async () => {
    removeErrors();
    let valid = true;

    if (!formData.name || formData.name.trim() === "") {
      valid = false;
      showError(nameErrorRef, "Enter your name.");
    }

    if (!formData.dob) {
      valid = false;
      showError(dobErrorRef, "Enter your date of birth.");
    }

    if (!formData.gender) {
      valid = false;
      showError(genderErrorRef, "Select your gender.");
    }

    if (!formData.phone || formData.phone.trim() === "") {
      valid = false;
      showError(phoneErrorRef, "Enter your phone number.");
    } else if (!/^\d{10}$/.test(formData.phone)) {
      valid = false;
      showError(phoneErrorRef, "Enter a valid 10-digit phone number.");
    }

    if (!formData.address || formData.address.trim() === "") {
      valid = false;
      showError(addressErrorRef, "Enter your address.");
    }

    if (!formData.specialization) {
      valid = false;
      showError(specializationErrorRef, "Select your specialization.");
    }

    if (!valid) {
      return;
    }

    const payload = {
      userId: userInfo.id,
      ...formData,
    };

    setLoading(true);
    try {
      const data = await saveDoctorProfileStage1(payload);
      if (data?.success) {
        dispatch(setName(formData.name));
        dispatch(setDob(formData.dob));
        dispatch(setGender(formData.gender));
        dispatch(setPhone(formData.phone));
        dispatch(setAddress(formData.address));
        const selectedSpec = specializationList.find(s => s.id === formData.specialization);
        dispatch(setSpecialization(selectedSpec ? selectedSpec.name : formData.specialization));
        dispatch(setAbout(formData.about));
        toast.success(data?.message || "Profile updated successfully.");
        closeModal();
      } else {
        throw new Error("An error occurred while saving profile.");
      }
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occurred while saving profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 h-screen w-screen"
      onClick={closeModal}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-800 shadow-2xl shadow-black/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {getIcon("profile", "24px")}
            </span>
            Edit Basic Information
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full p-2 transition-colors"
          >
            {getIcon("close", "24px")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="md:col-span-2">
            <ProfileCreationInput
              title="Full Name"
              placeholder="Enter your name"
              value={formData.name}
              changeState={(val) => handleChange("name", val as string)}
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={nameErrorRef}
            ></div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold pl-2">
              Specialization
            </p>
            <div className="border border-gray-200 dark:border-slate-700 px-4 rounded-2xl bg-white dark:bg-slate-800 h-[56px] flex items-center focus-within:border-darkGreen dark:focus-within:border-lightGreen transition-all">
              <select
                className="w-full h-full capitalize text-slate-700 dark:text-slate-200 text-base outline-none bg-transparent cursor-pointer"
                value={formData.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
              >
                <option value="" disabled className="dark:bg-slate-900">Select Specialization</option>
                {specializationList?.map((spec) => (
                  <option key={spec.id} value={spec.id} className="dark:bg-slate-900">
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={specializationErrorRef}
            ></div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold pl-2">
              Gender
            </p>
            <div className="border border-gray-200 dark:border-slate-700 px-4 rounded-2xl bg-white dark:bg-slate-800 h-[56px] flex items-center focus-within:border-darkGreen dark:focus-within:border-lightGreen transition-all">
              <select
                className="w-full h-full capitalize text-slate-700 dark:text-slate-200 text-base outline-none bg-transparent cursor-pointer"
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="" disabled className="dark:bg-slate-900">Select Gender</option>
                <option value="male" className="dark:bg-slate-900">Male</option>
                <option value="female" className="dark:bg-slate-900">Female</option>
                <option value="other" className="dark:bg-slate-900">Other</option>
              </select>
            </div>
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={genderErrorRef}
            ></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Date of Birth"
              type="date"
              value={formData.dob}
              changeState={(val) => handleChange("dob", val as string)}
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={dobErrorRef}
            ></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Phone Number"
              type="number"
              placeholder="Enter your phone number"
              value={formData.phone}
              changeState={(val) => handleChange("phone", val as string)}
            />
            <div
              className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
              ref={phoneErrorRef}
            ></div>
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col gap-2">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-bold pl-2">
                Address
              </p>
              <div className="flex flex-col relative w-full p-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 focus-within:border-darkGreen dark:focus-within:border-lightGreen transition-all">
                <textarea
                  className="p-3 text-slate-700 dark:text-slate-200 text-base w-full bg-transparent min-h-[100px] outline-none resize-none"
                  onChange={(e) => handleChange("address", e.target.value)}
                  value={formData.address}
                  placeholder="Enter your full clinic or practice address"
                ></textarea>
              </div>
              <div
                className="error-container text-red-500 text-xs font-bold mt-1.5 pl-2"
                ref={addressErrorRef}
              ></div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col gap-2">
              <p className="text-slate-600 dark:text-slate-400 text-sm font-bold pl-2">
                About / Professional Bio
              </p>
              <div className="flex flex-col relative w-full p-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 focus-within:border-darkGreen dark:focus-within:border-lightGreen transition-all">
                <textarea
                  className="p-3 text-slate-700 dark:text-slate-200 text-base w-full bg-transparent min-h-[120px] outline-none resize-none"
                  onChange={(e) => handleChange("about", e.target.value)}
                  value={formData.about}
                  placeholder="Tell patients about your expertise and care philosophy"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={closeModal}
            className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-10 py-3 bg-darkGreen dark:bg-emerald-600 text-white rounded-2xl font-bold hover:opacity-90 shadow-lg shadow-darkGreen/20 dark:shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading && <span className="animate-spin">{getIcon("loading", "18px")}</span>}
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DBasicInfoEditModal;
