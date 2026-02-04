import { useSelector } from "react-redux";
import getIcon from "../../../helpers/getIcon";
import type { RootState } from "../../../state/store";
import { useDoctorSlotManagementStore } from "../../../zustand/doctoreStore";
import ConfirmationModal from "../../common/ConfirmationModal";
import { useDispatch } from "react-redux";
import { deleteSlot } from "../../../state/doctor/dSlotSlice";
import toast from "react-hot-toast";
import { deleteSlot as deleteSlotApi } from "../../../api/doctor/dSlotManagementService";
import { useState } from "react";

function DViewSlot({ id }: { id: string }) {
  const dispatch = useDispatch();
  const slots = useSelector((state: RootState) => state.dSlot.slots);
  let viewSlot = slots.find((slot) => slot.id === id);
  const practiceLocations = useSelector(
    (state: RootState) => state.dProfileCreation.practiceLocations,
  );
  const toggleEditSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleEditSlotModal,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const confirmDelete = async () => {
    if (viewSlot) {
      try {
        const response = await deleteSlotApi(viewSlot.id);
        if (response.success) {
          dispatch(deleteSlot(viewSlot.id));
          toast.success("Slot deleted successfully");
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Slot"
        message="Are you sure you want to delete slot? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex-1">
        <div className="flex justify-between items-center mb-4 pb-1 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Slot Details</h3>
          {viewSlot && !viewSlot.isBooked && (
            <div className="flex gap-2">
              <button
                onClick={() => toggleEditSlotModal()}
                className="p-2 text-gray-500 hover:text-darkGreen hover:bg-green-50 rounded-lg transition-colors"
                title="Edit Slot"
              >
                {getIcon("edit")}
              </button>
              <button
                onClick={() => setDeleteConfirmOpen(true)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Slot"
              >
                {getIcon("trash")}
              </button>
            </div>
          )}
        </div>

        <div className="h-full">
          {viewSlot ? (
            <div className="space-y-3">
              <div className="p-2 px-4 rounded-xl bg-gray-50 border-1 border-gray-200">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Title
                </span>
                <p className="text-xl font-bold text-gray-800">
                  {viewSlot.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 px-4 rounded-xl bg-gray-50 border-1 border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Date
                  </span>
                  <p className="font-semibold text-gray-700">
                    {new Date(viewSlot.start).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-2 px-4 rounded-xl bg-gray-50 border-1 border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Status
                  </span>
                  <div
                    className={`mt-1 w-fit items-center px-2 py-0.5 rounded text-xs font-bold ${viewSlot.isBooked ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    {viewSlot.isBooked ? "Booked" : "Available"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 px-4 rounded-xl bg-gray-50 border-1 border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Start Time
                  </span>
                  <p className="font-semibold text-gray-700">
                    {new Date(viewSlot.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="p-2 px-4 rounded-xl bg-gray-50 border-1 border-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    End Time
                  </span>
                  <p className="font-semibold text-gray-700">
                    {new Date(viewSlot.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="p-2 px-4 rounded-xl bg-gray-50 border-1 border-gray-200">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Practice Location
                </span>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-700 capitalize">
                    {
                      practiceLocations.find(
                        (pLoc) => pLoc._id === viewSlot.practiceLocationId,
                      )?.name
                    }
                  </p>
                </div>
              </div>
              <div className="p-2 px-4 rounded-xl bg-gray-50 border-1 border-gray-200">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Consultation Mode
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${viewSlot.mode === "online" ? "bg-blue-400" : "bg-orange-400"}`}
                  ></span>
                  <p className="font-medium text-gray-700 capitalize">
                    {viewSlot.mode}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400/60 text-center p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 gap-2">
              {getIcon("calendar", "40px")}
              <p className="font-medium">Select a slot to view details</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DViewSlot;
