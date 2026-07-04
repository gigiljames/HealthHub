import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useEffect, useState } from "react";
import {
  saveUserProfileStage1,
} from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";
import {
  setAllergies,
  setBloodGroup,
  setDob,
  setGender,
  setMaritalStatus,
  setName,
  setOccupation,
} from "../../state/user/uProfileCreationSlice";
import LoadingCircle from "../common/LoadingCircle";

interface basicInfo {
  name: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  maritalStatus: string;
  allergies: string[];
  occupation: string;
}

function UProfileBasicInformation() {
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
  const email = useSelector((state: RootState) => state.userInfo.email);
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

  const [loading, setLoading] = useState(false);



  useEffect(() => {
    setFormData({
      name: name || "",
      gender: gender || "",
      dob: dob ? new Date(dob).toISOString().split("T")[0] : "",
      bloodGroup: bloodGroup || "",
      maritalStatus: maritalStatus || "",
      allergies: allergies ? allergies.join(", ") : "",
      occupation: occupation || "",
    });
  }, [name, gender, dob, bloodGroup, maritalStatus, allergies, occupation]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
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
        toast.success("Basic information updated successfully.");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update basic information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        Basic Information
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xl">
        Manage your personal information and preferences.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Registered Email
            </label>
            <input
              type="text"
              value={email}
              disabled
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              max={new Date().toISOString().split("T")[0]}
              onChange={handleChange}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
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
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Marital Status
            </label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">Select Marital Status</option>
              <option value="married">Married</option>
              <option value="unmarried">Unmarried</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Allergies (comma separated)
            </label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g. Peanuts, Dust"
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="e.g. Software Engineer"
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex justify-end pt-5 mt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen font-medium border-1 border-lightGreen text-white rounded-lg  disabled:opacity-50 flex items-center justify-center min-w-[140px]"
          >
            {loading ? <LoadingCircle /> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UProfileBasicInformation;
