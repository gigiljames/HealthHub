import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import {
  setFeatures,
  addFeature,
  removeFeature,
} from "../../../state/hospital/hProfileCreationSlice";
import {
  getHospitalProfileStage4,
  saveHospitalProfileStage4,
} from "../../../api/hospital/hProfileCreationService";
import getIcon from "../../../helpers/getIcon";
import toast from "react-hot-toast";
import LoadingCircle from "../../common/LoadingCircle";

function HProfileFeatures() {
  const dispatch = useDispatch();
  const features = useSelector(
    (state: RootState) => state.hProfileCreation.features
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [feature, setFeature] = useState("");

  useEffect(() => {
    if (features.length === 0) {
      setLoading(true);
      getHospitalProfileStage4()
        .then((response) => {
          if (response?.success && response.data?.features) {
            dispatch(setFeatures(response.data.features));
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to fetch hospital features.");
        })
        .finally(() => setLoading(false));
    }
  }, [dispatch, features.length]);

  const handleAddFeature = () => {
    if (feature.trim()) {
      dispatch(addFeature(feature.trim()));
      setFeature("");
    }
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    const payload = {
      hospitalId: userInfo.id,
      features,
    };

    try {
      const data = await saveHospitalProfileStage4(payload);
      if (data?.success) {
        toast.success("Features saved successfully.");
      } else {
        throw new Error("Failed to save changes.");
      }
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occurred while saving."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl border-1 border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <span className="uppercase font-semibold text-lg">
            Features & Facilities
          </span>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Add feature"
              className="border-1 border-gray-300 p-2 rounded-lg text-sm w-64"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddFeature();
              }}
            />
            <button
              className="flex items-center gap-2 bg-darkGreen text-white px-4 py-2 rounded-lg font-medium hover:-translate-y-0.5 transition-all duration-200"
              onClick={handleAddFeature}
            >
              {getIcon("add", "20px", "white")}
              Add
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingCircle />
          </div>
        ) : features.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border-dashed border-2 border-gray-200 rounded-xl">
            No features added yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {features.map((feat, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-800">{feat}</p>
                <button
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded transition-all duration-200"
                  onClick={() => dispatch(removeFeature(index))}
                  title="Remove"
                >
                  {getIcon("close", "20px", "currentColor")}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-8 pt-4 border-t border-gray-100">
          {features.length > 0 && (
            <button
              onClick={handleSaveChanges}
              className="px-6 py-2.5 bg-darkGreen text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              disabled={saveLoading}
            >
              {saveLoading && <LoadingCircle />}
              {saveLoading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HProfileFeatures;
