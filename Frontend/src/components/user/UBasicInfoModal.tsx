import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import type { RootState } from "../../state/store";
import { saveUserProfileStage1 } from "../../api/user/uProfileCreationService";
import {
  setAllergies,
  setBloodGroup,
  setDob,
  setGender,
  setMaritalStatus,
  setOccupation,
  setName,
} from "../../state/user/uProfileCreationSlice";

function UBasicInfoModal() {
  const { toggleEditBasicInfoModal } = useUserProfileCreationStore();
  const dispatch = useDispatch();
  const {
    name,
    gender,
    dob,
    bloodGroup,
    maritalStatus,
    allergies,
    occupation,
  } = useSelector((state: RootState) => state.uProfileCreation);
  const userId = useSelector((state: RootState) => state.userInfo.id);

  const [formData, setFormData] = useState({
    name: name || "",
    gender: gender || "",
    dob: dob ? new Date(dob).toISOString().split("T")[0] : "",
    bloodGroup: bloodGroup || "",
    maritalStatus: maritalStatus || "",
    allergies: allergies ? allergies.join(", ") : "",
    occupation: occupation || "",
  });

  const [errors, setErrors] = useState({
    name: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    maritalStatus: "",
    occupation: "",
  });

  const [loading, setLoading] = useState(false);

  const validate = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      gender: "",
      dob: "",
      bloodGroup: "",
      maritalStatus: "",
      occupation: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
      isValid = false;
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required.";
      isValid = false;
    }

    if (!formData.dob) {
      newErrors.dob = "Date of Birth is required.";
      isValid = false;
    } else {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dob = "Date of Birth cannot be in the future.";
        isValid = false;
      }
    }

    if (!formData.bloodGroup) {
      newErrors.bloodGroup = "Blood Group is required.";
      isValid = false;
    }

    if (!formData.maritalStatus) {
      newErrors.maritalStatus = "Marital Status is required.";
      isValid = false;
    }

    if (!formData.occupation.trim()) {
      newErrors.occupation = "Occupation is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    const allergiesArray = formData.allergies
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const payload = {
      ...formData,
      allergies: allergiesArray,
      userId,
    };

    try {
      const response = await saveUserProfileStage1(payload);
      if (response.success) {
        dispatch(setName(formData.name));
        dispatch(setGender(formData.gender));
        dispatch(setDob(formData.dob));
        dispatch(setBloodGroup(formData.bloodGroup));
        dispatch(setMaritalStatus(formData.maritalStatus));
        dispatch(setAllergies(allergiesArray));
        dispatch(setOccupation(formData.occupation));
        toast.success("Profile updated successfully");
        toggleEditBasicInfoModal();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 h-screen w-screen"
        onClick={(e) => {
          e.stopPropagation();
          toggleEditBasicInfoModal();
        }}
      >
        <div
          className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Edit Basic Information</h2>
            <button
              onClick={toggleEditBasicInfoModal}
              className="text-gray-500 hover:text-gray-700"
            >
              {getIcon("close", "24px", "black")}
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-xs text-red-500">{errors.gender}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={handleChange}
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.dob ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.dob && (
                  <p className="text-xs text-red-500">{errors.dob}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.bloodGroup ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Blood Group</option>
                  <option value="O positive">O positive</option>
                  <option value="O negative">O negative</option>
                  <option value="A positive">A positive</option>
                  <option value="A negative">A negative</option>
                  <option value="B positive">B positive</option>
                  <option value="B negative">B negative</option>
                  <option value="AB positive">AB positive</option>
                  <option value="AB negative">AB negative</option>
                  <option value="Rh-null">Rh-null</option>
                  <option value="HH">HH</option>
                </select>
                {errors.bloodGroup && (
                  <p className="text-xs text-red-500">{errors.bloodGroup}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Marital Status
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.maritalStatus ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Marital Status</option>
                  <option value="married">Married</option>
                  <option value="unmarried">Unmarried</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
                {errors.maritalStatus && (
                  <p className="text-xs text-red-500">{errors.maritalStatus}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.occupation ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.occupation && (
                  <p className="text-xs text-red-500">{errors.occupation}</p>
                )}
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Allergies (comma separated)
                </label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Peanuts, Dust"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={toggleEditBasicInfoModal}
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
    </>
  );
}

export default UBasicInfoModal;
