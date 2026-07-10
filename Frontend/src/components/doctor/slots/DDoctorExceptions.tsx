import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../../state/store";
import {
  getDoctorExceptions,
  deleteDoctorException,
} from "../../../api/doctor/dSlotManagementService";
import toast from "react-hot-toast";
import { Trash2, Calendar, Plus, Pencil } from "lucide-react";
import dayjs from "dayjs";
import ConfirmationModal from "../../common/ConfirmationModal";
import DAddExceptionModal from "./DAddExceptionModal";
import DEditExceptionModal from "./DEditExceptionModal";

export default function DDoctorExceptions({
  showAddModal,
  setShowAddModal,
}: {
  showAddModal?: boolean;
  setShowAddModal?: (show: boolean) => void;
}) {
  const doctorId = useSelector((state: RootState) => state.userInfo.id);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [localShowAddModal, setLocalShowAddModal] = useState(false);
  const showAddModalOpen = showAddModal !== undefined ? showAddModal : localShowAddModal;
  const setShowAddModalOpen = setShowAddModal !== undefined ? setShowAddModal : setLocalShowAddModal;

  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    id: string;
  }>({ open: false, id: "" });
  const [selectedException, setSelectedException] = useState<any>(null);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const data = await getDoctorExceptions(doctorId);
      if (data && data.success) {
        setExceptions(data.exceptions);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch exceptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, [doctorId]);

  const handleDelete = async (id: string) => {
    try {
      const data = await deleteDoctorException(id);
      if (data && data.success) {
        toast.success("Exception removed");
        fetchExceptions();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setConfirmDelete({ open: false, id: "" });
    }
  };

  const handleEditClick = (ex: any) => {
    setSelectedException(ex);
    setShowEditModal(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Holidays & Leave</h2>
          <p className="text-sm text-gray-500 mt-1">
            Times when you are unavailable. These override all your schedule rules.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkGreen"></div>
          </div>
        ) : exceptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p>No holidays or leave exceptions added yet.</p>
          </div>
        ) : (() => {
          const now = dayjs();
          const upcomingExceptions = exceptions.filter(
            (ex) => !dayjs(ex.endDatetime).isBefore(now)
          );
          const pastExceptions = exceptions.filter(
            (ex) => dayjs(ex.endDatetime).isBefore(now)
          );

          return (
            <div className="space-y-6">
              {/* Upcoming Holidays Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Upcoming & Active Holidays ({upcomingExceptions.length})
                </h3>
                {upcomingExceptions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-2">No upcoming or active holidays.</p>
                ) : (
                  <div className="grid gap-3">
                    {upcomingExceptions.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{ex.reason}</h4>
                            <p className="text-sm text-gray-500">
                              {dayjs(ex.startDatetime).format("MMM D, YYYY h:mm A")} - {dayjs(ex.endDatetime).format("MMM D, YYYY h:mm A")}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleEditClick(ex)}
                            className="p-2 text-gray-400 hover:text-darkGreen hover:bg-green-50 rounded-lg transition-all"
                            title="Edit Holiday"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete({ open: true, id: ex.id })}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Holiday"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Holidays Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Past Holidays ({pastExceptions.length})
                </h3>
                {pastExceptions.length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-2">No past holidays.</p>
                ) : (
                  <div className="grid gap-3">
                    {pastExceptions.map((ex) => (
                      <div
                        key={ex.id}
                        className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100/80 opacity-70"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-600 ">{ex.reason}</h4>
                            <p className="text-sm text-gray-400">
                              {dayjs(ex.startDatetime).format("MMM D, YYYY h:mm A")} - {dayjs(ex.endDatetime).format("MMM D, YYYY h:mm A")}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium px-2.5 py-1 bg-gray-100 rounded-full">
                          Past
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      <DAddExceptionModal
        isOpen={showAddModalOpen}
        onClose={() => setShowAddModalOpen(false)}
        onSuccess={fetchExceptions}
      />

      <DEditExceptionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedException(null);
        }}
        onSuccess={fetchExceptions}
        exception={selectedException}
      />

      <ConfirmationModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: "" })}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Remove Holiday/Leave"
        message="Are you sure you want to remove this holiday/leave exception? All availability rules for this period will be restored."
        confirmText="Remove"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
}
