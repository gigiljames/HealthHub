import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  saveUserProfileStage2,
} from "../../api/user/uProfileCreationService";
import {
  setAddress,
  setHeight,
  setPhoneNumber,
  setWeight,
} from "../../state/user/uProfileCreationSlice";
import LoadingCircle from "../common/LoadingCircle";

function UProfileContactInfo() {
  const dispatch = useDispatch();
  const address = useSelector(
    (state: RootState) => state.uProfileCreation.address,
  );
  const phone = useSelector(
    (state: RootState) => state.uProfileCreation.phoneNumber,
  );
  const height = useSelector(
    (state: RootState) => state.uProfileCreation.height,
  );
  const weight = useSelector(
    (state: RootState) => state.uProfileCreation.weight,
  );
  const userId = useSelector((state: RootState) => state.userInfo.id);

  const [formData, setFormData] = useState({
    address: address || "",
    phoneNumber: phone || "",
    height: height ? height.toString() : "",
    weight: weight ? weight.toString() : "",
  });

  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setFormData({
      address: address || "",
      phoneNumber: phone || "",
      height: height ? height.toString() : "",
      weight: weight ? weight.toString() : "",
    });
  }, [address, phone, height, weight]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);

    const payload = {
      address: formData.address,
      phoneNumber: formData.phoneNumber,
      height: parseFloat(formData.height) || 0,
      weight: parseFloat(formData.weight) || 0,
      userId,
    };

    try {
      const response = await saveUserProfileStage2(payload);
      if (response.success) {
        dispatch(setAddress(payload.address));
        dispatch(setPhoneNumber(payload.phoneNumber));
        dispatch(setHeight(payload.height));
        dispatch(setWeight(payload.weight));
        toast.success("Contact information updated successfully.");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update contact information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        Contact Information & Body Metrics
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xl">
        Manage how we reach you and record vital health parameters.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 123 Main St, New York"
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="e.g. +1 555 1234567"
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g. 180"
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="e.g. 75"
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

export default UProfileContactInfo;
