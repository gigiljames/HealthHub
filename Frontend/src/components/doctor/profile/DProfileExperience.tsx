import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import type { RootState } from "../../../state/store";
import {
  addExperience,
  updateExperience,
  deleteExperience,
} from "../../../state/doctor/dProfileCreationSlice";
import { saveDoctorProfileStage3 } from "../../../api/doctor/dProfileCreationService";
import getIcon from "../../../helpers/getIcon";
import toast from "react-hot-toast";
import DExperienceEditModal from "./DExperienceEditModal";
import LoadingCircle from "../../common/LoadingCircle";
import ConfirmationModal from "../../common/ConfirmationModal";

function DProfileExperience() {
  const dispatch = useDispatch();
  const experienceList = useSelector(
    (state: RootState) => state.dProfileCreation.experience,
  );
  const userInfo = useSelector((state: RootState) => state.userInfo);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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

  const syncWithBackend = async (updatedList: any[]) => {
    setIsLoading(true);
    try {
      const payload = {
        userId: userInfo.id,
        experience: updatedList,
      };
      const data = await saveDoctorProfileStage3(payload);
      if (data?.success) {
        toast.success("Experience details updated.");
      } else {
        throw new Error(data?.message || "Failed to sync with server.");
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      const updatedList = experienceList.filter(
        (exp) => exp.id !== itemToDelete,
      );
      dispatch(deleteExperience(itemToDelete));
      setItemToDelete(null);
      await syncWithBackend(updatedList);
    }
    setDeleteConfirmOpen(false);
  };

  const handleModalSave = async (experienceData: any) => {
    let updatedList;
    if (editingItem) {
      updatedList = experienceList.map((exp) =>
        exp.id === experienceData.id ? experienceData : exp,
      );
      dispatch(updateExperience(experienceData));
    } else {
      updatedList = [...experienceList, experienceData];
      dispatch(addExperience(experienceData));
    }
    setIsModalOpen(false);
    await syncWithBackend(updatedList);
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
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm p-6"
    >
      {isModalOpen && (
        <DExperienceEditModal
          existingExperience={editingItem}
          closeModal={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleModalSave}
        />
      )}

      {deleteConfirmOpen && (
        <ConfirmationModal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Experience"
          message="Are you sure you want to delete this experience entry? This action cannot be undone."
        />
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {/* <span className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {getIcon("experience", "16px")}
            </span> */}
            Professional Experience
            {isLoading && (
              <span className="ml-2 scale-75">
                <LoadingCircle />
              </span>
            )}
          </h2>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-darkGreen dark:bg-emerald-600 hover:opacity-90 text-white rounded-lg font-bold transition-all active:scale-95 shadow-md shadow-darkGreen/10 text-xs"
          >
            {getIcon("plus", "14px")}
            Add Experience
          </button>
        </div>

        {experienceList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {experienceList.map((exp: any) => (
                <motion.div
                  key={exp.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:border-darkGreen/30 dark:hover:border-lightGreen/30 transition-all hover:shadow-md"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {exp.designation}
                        </h3>
                        <span className="flex-shrink-0 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold rounded uppercase tracking-wider">
                          {exp.type.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-darkGreen dark:text-lightGreen mb-1 truncate">
                        {exp.hospital}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          {getIcon("calendar", "12px")}
                          {renderDate(exp.startDate)} —{" "}
                          {exp.present ? "Present" : renderDate(exp.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          {getIcon("location", "12px")}
                          {exp.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(exp)}
                        className="p-1.5 text-slate-400 hover:text-darkGreen dark:hover:text-lightGreen hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      >
                        {getIcon("edit", "14px")}
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                      >
                        {getIcon("trash", "14px")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex justify-center mb-2 text-slate-300">
              {getIcon("experience", "32px")}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">
              Your career highlights will appear here.
            </p>
            <button
              onClick={handleAddNew}
              className="mt-3 text-darkGreen dark:text-lightGreen font-bold text-xs hover:underline"
            >
              Add your first role
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default DProfileExperience;
