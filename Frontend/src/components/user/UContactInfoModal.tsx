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

  const { address, phoneNumber, height, weight } = useSelector(
    (state: RootState) => state.uProfileCreation
  );

  const [formData, setFormData] = useState({
    address: address || "",
    phoneNumber: phoneNumber || "",
    height: height || 0,
    weight: weight || 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await saveUserProfileStage2(formData);
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
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
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
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
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
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
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
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
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