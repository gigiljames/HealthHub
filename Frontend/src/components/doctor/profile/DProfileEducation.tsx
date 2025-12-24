import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import {
  setEducation,
  addEducation,
  updateEducation,
  deleteEducation,
} from "../../../state/doctor/dProfileCreationSlice";
import {
  getDoctorProfileStage2,
  saveDoctorProfileStage2,
} from "../../../api/doctor/dProfileCreationService";
import getIcon from "../../../helpers/getIcon";
import toast from "react-hot-toast";
import DEducationEditModal from "./DEducationEditModal";
import LoadingCircle from "../../common/LoadingCircle";
import ConfirmationModal from "../../common/ConfirmationModal";

function DProfileEducation() {
  const dispatch = useDispatch();
  const educationList = useSelector(
    (state: RootState) => state.dProfileCreation.education
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (educationList.length === 0) {
      setLoading(true);
      getDoctorProfileStage2()
        .then((response) => {
          if (response?.success && response.data?.education) {
            const mappedEducation = response.data.education.map((edu: any) => ({
              ...edu,
              id: edu._id || edu.id || Date.now().toString() + Math.random(),
            }));
            dispatch(setEducation(mappedEducation));
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to fetch education details.");
        })
        .finally(() => setLoading(false));
    }
  }, [dispatch, educationList.length]);

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
      dispatch(deleteEducation(itemToDelete));
      setItemToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleModalSave = (educationData: any) => {
    if (editingItem) {
      dispatch(updateEducation(educationData));
    } else {
      dispatch(addEducation(educationData));
    }
    setIsModalOpen(false);
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    const payload = {
      userId: userInfo.id,
      education: educationList,
    };

    try {
      const data = await saveDoctorProfileStage2(payload);
      if (data?.success) {
        toast.success("Education details saved successfully.");
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
      {isModalOpen && (
        <DEducationEditModal
          existingEducation={editingItem}
          closeModal={() => setIsModalOpen(false)}
          onSave={handleModalSave}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Education"
        message="Are you sure you want to delete this education entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />

      <div className="bg-white rounded-2xl border-1 border-gray-200 p-8">
        <div className="flex justify-between items-center mb-6">
          <span className="uppercase font-semibold text-lg">Education</span>
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
        ) : educationList.length === 0 ? (
          <div className="text-center text-gray-500 py-8 border-dashed border-2 border-gray-200 rounded-xl">
            No education details added yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {educationList.map((edu) => (
              <div
                key={edu.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {edu.title}
                  </h3>
                  <p className="font-medium text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    Graduation Year: {edu.graduationYear}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-gray-500 mt-1 max-w-xl">
                      {edu.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <button
                    onClick={() => handleEdit(edu)}
                    className="p-2 text-gray-600 hover:text-darkGreen hover:bg-green-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    {getIcon("edit", "20px", "currentColor")}
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    {getIcon("trash", "20px", "currentColor")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-8 pt-4 border-t border-gray-100">
          {educationList.length > 0 && (
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

export default DProfileEducation;
