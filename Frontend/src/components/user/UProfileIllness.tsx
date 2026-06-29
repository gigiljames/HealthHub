import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../state/store";
import { useEffect, useState } from "react";
import {
  getUserProfileStage3,
  saveUserProfileStage3,
} from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";
import {
  setBronchialAsthma,
  setEpilepsy,
  setTb,
} from "../../state/user/uProfileCreationSlice";
import LoadingCircle from "../common/LoadingCircle";

function UProfileIllness() {
  const dispatch = useDispatch();
  const tb = useSelector((state: RootState) => state.uProfileCreation.tb);
  const bronchialAsthma = useSelector(
    (state: RootState) => state.uProfileCreation.bronchialAsthma,
  );
  const epilepsy = useSelector(
    (state: RootState) => state.uProfileCreation.epilepsy,
  );
  const userId = useSelector((state: RootState) => state.userInfo.id);

  const [formData, setFormData] = useState({
    tb: tb === null ? false : tb,
    bronchialAsthma: bronchialAsthma === null ? false : bronchialAsthma,
    epilepsy: epilepsy === null ? false : epilepsy,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tb === null || bronchialAsthma === null || epilepsy === null) {
      getUserProfileStage3()
        .then((response) => {
          const data = response.data;
          dispatch(setTb(data.tb));
          dispatch(setBronchialAsthma(data.bronchialAsthma));
          dispatch(setEpilepsy(data.epilepsy));
        })
        .catch((err) => {
          console.log(err);
          toast.error("An error occured while fetching data.");
        });
    }
  }, [dispatch, tb, bronchialAsthma, epilepsy]);

  useEffect(() => {
    setFormData({
      tb: tb === null ? false : tb,
      bronchialAsthma: bronchialAsthma === null ? false : bronchialAsthma,
      epilepsy: epilepsy === null ? false : epilepsy,
    });
  }, [tb, bronchialAsthma, epilepsy]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value === "true" });
  };

  const handleSave = async () => {
    setLoading(true);

    const payload = {
      ...formData,
      userId,
    };

    try {
      const response = await saveUserProfileStage3(payload);
      if (response.success) {
        dispatch(setTb(payload.tb));
        dispatch(setBronchialAsthma(payload.bronchialAsthma));
        dispatch(setEpilepsy(payload.epilepsy));
        toast.success("Previous illnesses updated successfully.");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update previous illnesses.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        Previous Illnesses
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xl">
        Maintain a medical background history for more efficient care.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tuberculosis
            </label>
            <select
              name="tb"
              value={formData.tb ? "true" : "false"}
              onChange={handleChange}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Bronchial Asthma
            </label>
            <select
              name="bronchialAsthma"
              value={formData.bronchialAsthma ? "true" : "false"}
              onChange={handleChange}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Epilepsy
            </label>
            <select
              name="epilepsy"
              value={formData.epilepsy ? "true" : "false"}
              onChange={handleChange}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-darkGreen focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
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

export default UProfileIllness;
