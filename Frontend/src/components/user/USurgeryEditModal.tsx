import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import type { RootState } from "../../state/store";
import { saveUserProfileStage4 } from "../../api/user/uProfileCreationService";
import { setSurgeries, type Surgery } from "../../state/user/uProfileCreationSlice";

function USurgeryEditModal() {
  const { toggleEditSurgeryModal } = useUserProfileCreationStore();
  const dispatch = useDispatch();

  const { pastSurgeries } = useSelector(
    (state: RootState) => state.uProfileCreation
  );

  const [localSurgeries, setLocalSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pastSurgeries) {
      setLocalSurgeries([...pastSurgeries]);
    }
  }, [pastSurgeries]);

  const handleChange = (index: number, field: keyof Surgery, value: string) => {
    const updatedSurgeries = [...localSurgeries];
    updatedSurgeries[index] = { ...updatedSurgeries[index], [field]: value };
    setLocalSurgeries(updatedSurgeries);
  };

  const handleDelete = (index: number) => {
    const updatedSurgeries = localSurgeries.filter((_, i) => i !== index);
    setLocalSurgeries(updatedSurgeries);
  };

  const handleAddSurgery = () => {
    setLocalSurgeries([
      ...localSurgeries,
      {
        year: "",
        surgeryName: "",
        reason: "",
        surgeryType: "minor",
        doctor: "",
        hospital: "",
      },
    ]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await saveUserProfileStage4({ surgeries: localSurgeries });
      if (response) {
        dispatch(setSurgeries(localSurgeries));
        toast.success("Surgeries updated successfully");
        toggleEditSurgeryModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update surgeries");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 h-screen w-screen"
      onClick={(e) => {
        e.stopPropagation();
        toggleEditSurgeryModal();
      }}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Past Surgeries</h2>
          <button
            onClick={toggleEditSurgeryModal}
            className="text-gray-500 hover:text-gray-700"
          >
            {getIcon("close", "24px", "black")}
          </button>
        </div>

        <div className="space-y-6">
          {localSurgeries.map((surgery, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 relative"
            >
              <button
                onClick={() => handleDelete(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete Surgery"
              >
                {getIcon("trash", "20px", "currentColor")}
              </button>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  value={surgery.year}
                  onChange={(e) => handleChange(index, "year", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Year"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Surgery Name
                </label>
                <input
                  type="text"
                  value={surgery.surgeryName}
                  onChange={(e) =>
                    handleChange(index, "surgeryName", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Surgery Name"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={surgery.reason}
                  onChange={(e) => handleChange(index, "reason", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Reason"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={surgery.surgeryType}
                  onChange={(e) =>
                    handleChange(index, "surgeryType", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <input
                  type="text"
                  value={surgery.doctor}
                  onChange={(e) => handleChange(index, "doctor", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Doctor"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Hospital
                </label>
                <input
                  type="text"
                  value={surgery.hospital}
                  onChange={(e) =>
                    handleChange(index, "hospital", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Hospital"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAddSurgery}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors flex items-center justify-center gap-2"
          >
            {getIcon("add", "20px", "currentColor")}
            Add Surgery
          </button>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={toggleEditSurgeryModal}
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

export default USurgeryEditModal;
