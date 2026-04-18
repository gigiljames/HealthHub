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
    (state: RootState) => state.uProfileCreation.pastSurgeries,
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

  const confirmDelete = async () => {
    if (indexToDelete !== null) {
      const newSurgeries = [...surgeries];
      newSurgeries.splice(indexToDelete, 1);

      try {
        const response = await saveUserProfileStage4({
          userId: userInfo.id,
          surgeries: newSurgeries,
        });

        if (response?.success) {
          dispatch(removeSurgery(indexToDelete));
          toast.success("Surgery record removed successfully.");
        } else {
          throw new Error(response?.message || "Failed to remove surgery");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while deleting surgery.");
      } finally {
        setIndexToDelete(null);
        setDeleteConfirmOpen(false);
      }
    } else {
      setDeleteConfirmOpen(false);
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

      <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-2xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Past Surgeries
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
              Keep a record of previous major or minor surgical procedures.
            </p>
          </div>
          <button
            onClick={toggleSurgeryModal}
            className="flex items-center text-white justify-center gap-2 bg-lightGreen/80 hover:bg-lightGreen/90 transition-colors duration-200 active:bg-lightGreen font-medium border-1 border-lightGreen px-5 py-2.5 rounded-lg w-full md:w-auto"
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
          <div className="text-center text-gray-500 py-10 border-dashed border-2 border-gray-200 dark:border-gray-800 rounded-xl">
            <p className="mb-2 text-gray-400 dark:text-gray-500">
              No past surgeries recorded.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Surgery
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {surgeries.map((surgery, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {surgery.year}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {surgery.surgeryName}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {surgery.reason}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        surgery.surgeryType === "major"
                          ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 outline outline-1 outline-red-200 dark:outline-red-800"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 outline outline-1 outline-blue-200 dark:outline-blue-800"
                      }`}
                      >
                        {surgery.surgeryType}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {surgery.doctor}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {surgery.hospital}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleEdit(surgery, index)}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          {getIcon("edit", "18px", "currentColor")}
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          {getIcon("trash", "18px", "currentColor")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UProfileSurgery;
