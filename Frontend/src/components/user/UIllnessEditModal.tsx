import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import type { RootState } from "../../state/store";
import { saveUserProfileStage3 } from "../../api/user/uProfileCreationService";
import {
  setBronchialAsthma,
  setEpilepsy,
  setTb,
} from "../../state/user/uProfileCreationSlice";

function UIllnessEditModal() {
  const { toggleEditIllnessModal } = useUserProfileCreationStore();
  const dispatch = useDispatch();

  const { tb, bronchialAsthma, epilepsy } = useSelector(
    (state: RootState) => state.uProfileCreation
  );

  const [formData, setFormData] = useState({
    tb: tb || false,
    bronchialAsthma: bronchialAsthma || false,
    epilepsy: epilepsy || false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      tb: tb || false,
      bronchialAsthma: bronchialAsthma || false,
      epilepsy: epilepsy || false,
    });
  }, [tb, bronchialAsthma, epilepsy]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await saveUserProfileStage3(formData);
      if (response.success) {
        dispatch(setTb(formData.tb));
        dispatch(setBronchialAsthma(formData.bronchialAsthma));
        dispatch(setEpilepsy(formData.epilepsy));
        toast.success("Illness details updated successfully");
        toggleEditIllnessModal();
      }else{
        throw new Error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update illness details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 h-screen w-screen"
      onClick={(e) => {
        e.stopPropagation();
        toggleEditIllnessModal();
      }}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Previous Illnesses</h2>
          <button
            onClick={toggleEditIllnessModal}
            className="text-gray-500 hover:text-gray-700"
          >
            {getIcon("close", "24px", "black")}
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <label
              htmlFor="tb"
              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
            >
              Tuberculosis
            </label>
            <input
              type="checkbox"
              id="tb"
              name="tb"
              checked={formData.tb}
              onChange={handleChange}
              className="w-5 h-5 text-darkGreen rounded focus:ring-green-500 border-gray-300"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <label
              htmlFor="bronchialAsthma"
              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
            >
              Bronchial Asthma
            </label>
            <input
              type="checkbox"
              id="bronchialAsthma"
              name="bronchialAsthma"
              checked={formData.bronchialAsthma}
              onChange={handleChange}
              className="w-5 h-5 text-darkGreen rounded focus:ring-green-500 border-gray-300"
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
            <label
              htmlFor="epilepsy"
              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
            >
              Epilepsy
            </label>
            <input
              type="checkbox"
              id="epilepsy"
              name="epilepsy"
              checked={formData.epilepsy}
              onChange={handleChange}
              className="w-5 h-5 text-darkGreen rounded focus:ring-green-500 border-gray-300"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={toggleEditIllnessModal}
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

export default UIllnessEditModal;
