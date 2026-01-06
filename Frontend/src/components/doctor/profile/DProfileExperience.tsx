import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import {
  setExperience,
  addExperience,
  updateExperience,
  deleteExperience,
} from "../../../state/doctor/dProfileCreationSlice";
import {
  getDoctorProfileStage3,
  saveDoctorProfileStage3,
} from "../../../api/doctor/dProfileCreationService";
import getIcon from "../../../helpers/getIcon";
import toast from "react-hot-toast";
import DExperienceEditModal from "./DExperienceEditModal";
import LoadingCircle from "../../common/LoadingCircle";
import ConfirmationModal from "../../common/ConfirmationModal";

function DProfileExperience() {
  const dispatch = useDispatch();
  const experienceList = useSelector(
    (state: RootState) => state.dProfileCreation.experience
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (experienceList.length === 0) {
      setLoading(true);
      getDoctorProfileStage3()
        .then((response) => {
          if (response?.success && response.data?.experience) {
            const mappedExperience = response.data.experience.map(
              (exp: any) => ({
                ...exp,
                id: exp._id || exp.id || Date.now().toString() + Math.random(),
              })
            );
            dispatch(setExperience(mappedExperience));
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to fetch experience details.");
        })
        .finally(() => setLoading(false));
    }
  }, [dispatch, experienceList.length]);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      dispatch(deleteExperience(itemToDelete));
      setItemToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleModalSave = (experienceData: any) => {
    if (editingItem) {
      dispatch(updateExperience(experienceData));
    } else {
      dispatch(addExperience(experienceData));
    }
    setIsModalOpen(false);
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    const payload = {
      userId: userInfo.id,
      experience: experienceList,
    };

    try {
      const data = await saveDoctorProfileStage3(payload);
      if (data?.success) {
        toast.success("Experience details saved successfully.");
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

  const renderDate = (dateObj: { year: number; month: number } | undefined) => {
    if (!dateObj) return "";
    const date = new Date(dateObj.year, dateObj.month - 1);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {isModalOpen && (
        <DExperienceEditModal
          existingExperience={editingItem}
          closeModal={() => setIsModalOpen(false)}
          onSave={handleModalSave}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Experience"
        message="Are you sure you want to delete this experience entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      <div className="bg-white rounded-2xl border-1 border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <span className="uppercase font-semibold text-lg">Experience</span>
          <button
            onClick={handleAddNew}
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
        ) : experienceList.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border-dashed border-2 border-gray-200 rounded-xl">
            No experience details added yet.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {experienceList.map((exp) => (
              <div
                key={exp.id}
                className="flex flex-col border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {exp.designation}
                    </h3>
                    <p className="font-medium text-gray-700">{exp.hospital}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span>
                        {renderDate(exp.startDate)} -{" "}
                        {exp.present ? "Present" : renderDate(exp.endDate)}
                      </span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{exp.location}</span>
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full capitalize">
                      {exp.type.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(exp)}
                      className="p-2 text-gray-600 hover:text-darkGreen hover:bg-green-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      {getIcon("edit", "20px", "currentColor")}
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      {getIcon("trash", "20px", "currentColor")}
                    </button>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-gray-600 mt-3 text-sm border-t border-gray-100 pt-3">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-8 pt-4 border-t border-gray-100">
          {experienceList.length > 0 && (
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

export default DProfileExperience;
