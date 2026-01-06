import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import type { RootState } from "../../state/store";
import { saveUserProfileStage2 } from "../../api/user/uProfileCreationService";
import {
  setAddress,
  setHeight,
  setPhoneNumber,
  setWeight,
} from "../../state/user/uProfileCreationSlice";

function UContactInfoModal() {
  const { toggleEditContactInfoModal } = useUserProfileCreationStore();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.userInfo);

  const { address, phoneNumber, height, weight } = useSelector(
    (state: RootState) => state.uProfileCreation
  );

  const [formData, setFormData] = useState({
    address: address || "",
    phoneNumber: phoneNumber || "",
    height: height || 0,
    weight: weight || 0,
  });

  const [errors, setErrors] = useState({
    address: "",
    phoneNumber: "",
    height: "",
    weight: "",
  });

  const [loading, setLoading] = useState(false);

  const validate = () => {
    let isValid = true;
    const newErrors = {
      address: "",
      phoneNumber: "",
      height: "",
      weight: "",
    };

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits.";
      isValid = false;
    }

    if (!formData.height || Number(formData.height) <= 0) {
      newErrors.height = "Height must be greater than 0.";
      isValid = false;
    }

    if (!formData.weight || Number(formData.weight) <= 0) {
      newErrors.weight = "Weight must be greater than 0.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await saveUserProfileStage2({
        ...formData,
        weight: String(formData.weight),
        height: String(formData.height),
        userId: userInfo.id,
      });
      if (response) {
        dispatch(setAddress(formData.address));
        dispatch(setPhoneNumber(formData.phoneNumber));
        dispatch(setHeight(Number(formData.height)));
        dispatch(setWeight(Number(formData.weight)));
        toast.success("Contact info updated successfully");
        toggleEditContactInfoModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update contact info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 h-screen w-screen"
      onClick={(e) => {
        e.stopPropagation();
        toggleEditContactInfoModal();
      }}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Contact Information</h2>
          <button
            onClick={toggleEditContactInfoModal}
            className="text-gray-500 hover:text-gray-700"
          >
            {getIcon("close", "24px", "black")}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.address && (
                <p className="text-xs text-red-500">{errors.address}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-500">{errors.phoneNumber}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.height ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.height && (
                <p className="text-xs text-red-500">{errors.height}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.weight ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.weight && (
                <p className="text-xs text-red-500">{errors.weight}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={toggleEditContactInfoModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-darkGreen text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UContactInfoModal;
