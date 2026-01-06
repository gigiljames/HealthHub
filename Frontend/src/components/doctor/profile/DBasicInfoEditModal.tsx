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
} from "../../../state/doctor/dProfileCreationSlice";
import type { RootState } from "../../../state/store";
import ProfileCreationInput from "../../common/ProfileCreationInput";
import { getSpecializationList } from "../../../api/doctor/dProfileCreationService";

interface DBasicInfoEditModalProps {
  closeModal: () => void;
}

function DBasicInfoEditModal({ closeModal }: DBasicInfoEditModalProps) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const { name, dob, gender, phone, address, specialization } = useSelector(
    (state: RootState) => state.dProfileCreation
  );
  const [formData, setFormData] = useState({
    name: name || "",
    dob: dob || "",
    gender: gender || "",
    phone: phone || "",
    address: address || "",
    specialization: specialization || "",
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
      if (response?.success) {
        setSpecializationList(response.data);
      }
    });
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const showError = (
    ref: React.RefObject<HTMLDivElement | null>,
    message: string
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
      toast.error("Please fix the errors in the form.");
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
        dispatch(setSpecialization(formData.specialization));
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
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 h-screen w-screen"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Basic Information</h2>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1"
          >
            {getIcon("close", "24px", "black")}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="md:col-span-2">
            <ProfileCreationInput
              title="Name"
              placeholder="Enter your name"
              value={formData.name}
              changeState={(val) => handleChange("name", val as string)}
            />
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={nameErrorRef}
            ></div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Specialization
            </p>
            <div className="border-1 border-inputBorder px-3 rounded-lg peer bg-white h-[50px]">
              <select
                className="w-full h-full capitalize text-sm md:text-[16px] outline-none bg-transparent"
                value={formData.specialization}
                onChange={(e) => handleChange("specialization", e.target.value)}
              >
                <option value="">Select Specialization</option>
                {specializationList.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={specializationErrorRef}
            ></div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
              Gender
            </p>
            <div className="border-1 border-inputBorder px-3 rounded-lg peer bg-white h-[50px]">
              <select
                className="w-full h-full capitalize text-sm md:text-[16px] outline-none bg-transparent"
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={genderErrorRef}
            ></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Date of birth"
              type="date"
              value={formData.dob}
              changeState={(val) => handleChange("dob", val as string)}
            />
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={dobErrorRef}
            ></div>
          </div>

          <div>
            <ProfileCreationInput
              title="Phone number"
              type="number"
              placeholder="Enter your phone number"
              value={formData.phone}
              changeState={(val) => handleChange("phone", val as string)}
            />
            <div
              className="error-container text-red-500 text-sm mt-1"
              ref={phoneErrorRef}
            ></div>
          </div>

          <div className="md:col-span-2">
            <div className="flex flex-col gap-1">
              <p className="text-[#717171] text-[12px] md:text-sm font-semibold pl-2">
                Address
              </p>
              <div className="flex flex-col relative w-full mb-1.5 p-1 bg-white rounded-lg border-1 border-inputBorder">
                <textarea
                  className="p-2 peer text-sm md:text-[16px] w-full bg-white min-h-[80px] outline-none resize-none"
                  onChange={(e) => handleChange("address", e.target.value)}
                  value={formData.address}
                  placeholder="Enter your address"
                ></textarea>
              </div>
              <div
                className="error-container text-red-500 text-sm mt-1"
                ref={addressErrorRef}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={closeModal}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-darkGreen text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DBasicInfoEditModal;
