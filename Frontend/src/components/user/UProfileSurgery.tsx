import { useDispatch, useSelector } from "react-redux";
import {
  setSurgeries,
  removeSurgery,
  type Surgery,
} from "../../state/user/uProfileCreationSlice";
import type { RootState } from "../../state/store";
import { useEffect, useState } from "react";
import {
  getUserProfileStage4,
  saveUserProfileStage4,
} from "../../api/user/uProfileCreationService";
import toast from "react-hot-toast";
import getIcon from "../../helpers/getIcon";
import { useUserProfileCreationStore } from "../../zustand/userStore";
import USurgeryModal from "./USurgeryModal";
import ConfirmationModal from "../common/ConfirmationModal";
import LoadingCircle from "../common/LoadingCircle";

function UProfileSurgery() {
  const dispatch = useDispatch();
  const surgeries = useSelector(
    (state: RootState) => state.uProfileCreation.pastSurgeries
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const {
    editSurgeryModal,
    surgeryModal,
    toggleSurgeryModal,
    toggleEditSurgeryModal,
    setEditData,
  } = useUserProfileCreationStore();

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (surgeries.length === 0) {
      setLoading(true);
      getUserProfileStage4()
        .then((response) => {
          // Adjust based on actual API response structure if needed
          const data: Surgery[] = response.data?.surgeries || [];
          dispatch(setSurgeries(data));
        })
        .catch((err) => {
          console.log(err);
          toast.error("An error occured while fetching data.");
        })
        .finally(() => setLoading(false));
    }
  }, [dispatch, surgeries.length]);

  const handleEdit = (surgery: Surgery, index: number) => {
    setEditData({ ...surgery, index });
    toggleEditSurgeryModal();
  };

  const handleDelete = (index: number) => {
    setIndexToDelete(index);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (indexToDelete !== null) {
      dispatch(removeSurgery(indexToDelete));
      setIndexToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    const payload = {
      userId: userInfo.id,
      surgeries: surgeries,
    };

    try {
      const data = await saveUserProfileStage4(payload);
      if (data?.success) {
        toast.success("Surgery details saved successfully.");
      } else {
        throw new Error("Failed to save changes.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {editSurgeryModal && <USurgeryModal type="edit" />}
      {surgeryModal && <USurgeryModal type="add" />}

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Surgery"
        message="Are you sure you want to delete this surgery record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      <div className="bg-white p-8 rounded-2xl border-1 border-gray-200">
        <div className="flex gap-3 items-center justify-between mb-6">
          <span className="uppercase font-semibold text-lg">
            Past Surgeries
          </span>
          <button
            onClick={toggleSurgeryModal}
            className="flex items-center gap-2 bg-darkGreen text-white px-4 py-2 rounded-lg font-medium hover:-translate-y-0.5 transition-all duration-200"
          >
            {getIcon("add", "20px", "white")}
            Add New
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingCircle />
          </div>
        ) : surgeries.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border-dashed border-2 border-gray-200 rounded-xl">
            No past surgeries recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surgery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {surgeries.map((surgery, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {surgery.year}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {surgery.surgeryName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {surgery.reason}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        surgery.surgeryType === "major"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                      >
                        {surgery.surgeryType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {surgery.doctor}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {surgery.hospital}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(surgery, index)}
                          className="hover:text-darkGreen transition-colors"
                          title="Edit"
                        >
                          {getIcon("edit", "20px", "currentColor")}
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          {getIcon("trash", "20px", "currentColor")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={handleSaveChanges}
            disabled={saveLoading}
            className="px-6 py-2.5 bg-darkGreen text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {saveLoading && <LoadingCircle />}
            {saveLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UProfileSurgery;
