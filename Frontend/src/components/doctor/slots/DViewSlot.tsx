import { useSelector } from "react-redux";
import type { RootState } from "../../../state/store";
import { useDoctorSlotManagementStore } from "../../../zustand/doctoreStore";
import ConfirmationModal from "../../common/ConfirmationModal";
import { useDispatch } from "react-redux";
import { deleteSlot, editSlot } from "../../../state/doctor/dSlotSlice";
import toast from "react-hot-toast";
import {
  deleteSlot as deleteSlotApi,
  blockSlot as blockSlotApi,
  unblockSlot as unblockSlotApi,
  createSlot as createSlotApi,
  deleteScheduleRule as deleteScheduleRuleApi,
} from "../../../api/doctor/dSlotManagementService";
import { useState } from "react";
import { Ban, Trash2, Edit2, CheckCircle, Repeat, CalendarX } from "lucide-react";
import dayjs from "dayjs";
import { type Slot } from "../../../state/doctor/dSlotSlice";

function DViewSlot({
  id,
  onEditSeries,
  onUpdate,
  onDelete,
}: {
  id: string;
  onEditSeries?: (ruleId: string) => void;
  onUpdate?: (updatedSlot: Slot) => void;
  onDelete?: (slotId: string, seriesId?: string) => void;
}) {
  const dispatch = useDispatch();
  const slots = useSelector((state: RootState) => state.dSlot.slots);

  // Use a more robust find that handles potential ID type mismatches
  const viewSlot = slots.find((slot) => String(slot.id) === String(id));

  const practiceLocations = useSelector(
    (state: RootState) => state.dProfileCreation.practiceLocations,
  );
  const toggleEditSlotModal = useDoctorSlotManagementStore(
    (state) => state.toggleEditSlotModal,
  );

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "delete" | "block" | "delete-series";
  }>({ open: false, type: "delete" });

  const handleBlockUnblock = async () => {
    if (!viewSlot) return;
    try {
      if (viewSlot.status === "BLOCKED") {
        const response = await unblockSlotApi(viewSlot.id!);
        if (response.success) {
          if (onUpdate) {
            onUpdate(response.slot);
          } else {
            dispatch(editSlot(response.slot));
          }
          toast.success("Slot unblocked");
        }
      } else {
        if (viewSlot.isVirtual) {
          // Creating an override for a virtual slot to block it
          const response = await createSlotApi({
            title: viewSlot.title,
            start: viewSlot.start,
            end: viewSlot.end,
            mode: viewSlot.mode,
            practiceLocationId: viewSlot.practiceLocationId,
            isBooked: false,
            status: "BLOCKED",
            scheduleRuleId: viewSlot.scheduleRuleId,
          } as any);
          if (response.success) {
            toast.success("Slot blocked");
            if (onUpdate) {
              onUpdate(response.slot);
            } else {
              window.location.reload();
            }
          }
        } else {
          const response = await blockSlotApi(viewSlot.id!);
          if (response.success) {
            if (onUpdate) {
              onUpdate(response.slot);
            } else {
              dispatch(editSlot(response.slot));
            }
            toast.success("Slot blocked");
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const confirmAction = async () => {
    if (!viewSlot) return;
    const currentType = confirmModal.type;
    setConfirmModal({ open: false, type: currentType });
    try {
      if (currentType === "delete") {
        if (viewSlot.isVirtual) {
          // To "delete" a virtual slot occurrence, we block it
          await handleBlockUnblock();
        } else {
          const response = await deleteSlotApi(viewSlot.id!);
          if (response.success) {
            toast.success("Slot deleted successfully");
            if (onDelete) {
              onDelete(viewSlot.id!);
            } else {
              dispatch(deleteSlot(viewSlot.id!));
            }
          }
        }
      } else if (currentType === "delete-series") {
        if (viewSlot.scheduleRuleId) {
          const response = await deleteScheduleRuleApi(viewSlot.scheduleRuleId);
          if (response.success) {
            toast.success("Schedule series deleted");
            if (onDelete) {
              onDelete(viewSlot.id!, viewSlot.scheduleRuleId);
            } else {
              window.location.reload();
            }
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const isPastSlot = viewSlot ? dayjs(viewSlot.start).isBefore(dayjs()) : false;

  return (
    <>
      <ConfirmationModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ ...confirmModal, open: false })}
        onConfirm={confirmAction}
        title={
          confirmModal.type === "delete-series"
            ? "Delete Series"
            : "Delete Slot"
        }
        message={
          confirmModal.type === "delete-series"
            ? "Are you sure you want to delete the ENTIRE recurring schedule? All clinical availability from this rule will be removed."
            : "Are you sure you want to delete this slot? If it's part of a schedule, it will be blocked."
        }
        confirmText="Confirm"
        cancelText="Cancel"
        isDestructive={true}
      />

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 flex-1 flex flex-col ">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Slot Details</h3>
          {viewSlot && !viewSlot.isBooked && !isPastSlot && (
            <div className="flex gap-1.5">
              <button
                onClick={() => toggleEditSlotModal()}
                className="p-2 text-gray-500 hover:text-darkGreen hover:bg-green-50 rounded-xl transition-all"
                title="Edit this occurrence"
              >
                <Edit2 size={18} />
              </button>

              {viewSlot.scheduleRuleId && onEditSeries && (
                <button
                  onClick={() => onEditSeries(viewSlot.scheduleRuleId!)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Edit entire series"
                >
                  <Repeat size={18} />
                </button>
              )}

              <button
                onClick={handleBlockUnblock}
                className={`p-2 rounded-xl transition-all ${viewSlot.status === "BLOCKED" ? "text-green-500 hover:bg-green-50" : "text-amber-500 hover:bg-amber-50"}`}
                title={
                  viewSlot.status === "BLOCKED" ? "Unblock Slot" : "Block Slot"
                }
              >
                {viewSlot.status === "BLOCKED" ? (
                  <CheckCircle size={18} />
                ) : (
                  <Ban size={18} />
                )}
              </button>

              {!viewSlot.scheduleRuleId && (
                <button
                  onClick={() => setConfirmModal({ open: true, type: "delete" })}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete this occurrence"
                >
                  <Trash2 size={18} />
                </button>
              )}

              {viewSlot.scheduleRuleId && (
                <button
                  onClick={() =>
                    setConfirmModal({ open: true, type: "delete-series" })
                  }
                  className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                  title="Delete entire series"
                >
                  <CalendarX size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1">
          {viewSlot ? (
            <div className="space-y-4">
              {viewSlot.isVirtual && (
                <div className="py-2.5 px-4 bg-darkGreen/10 text-darkGreen rounded-2xl text-[11px] font-black tracking-wider border border-darkGreen/20 flex items-center gap-2.5 mb-2 uppercase animate-in slide-in-from-top-1">
                  <Repeat size={14} /> Generated Pattern
                </div>
              )}

              {!viewSlot.isVirtual && viewSlot.scheduleRuleId && (
                <div className="py-2.5 px-4 bg-amber-50 text-amber-700 rounded-2xl text-[11px] font-black tracking-wider border border-amber-200 flex items-center gap-2.5 mb-2 uppercase">
                  <Edit2 size={14} /> Schedule Override
                </div>
              )}

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                  APPOINTMENT TITLE
                </span>
                <p className="text-lg font-bold text-gray-900 leading-tight">
                  {viewSlot.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                    DATE
                  </span>
                  <p className="font-bold text-gray-800">
                    {dayjs(viewSlot.start).format("MMM D, YYYY")}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                    STATUS
                  </span>
                  <div
                    className={`mt-1 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${viewSlot.isBooked
                      ? "bg-green-100 text-green-700"
                      : viewSlot.status === "BLOCKED"
                        ? "bg-red-100 text-red-700 font-bold"
                        : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {viewSlot.isBooked
                      ? "Booked"
                      : viewSlot.status === "BLOCKED"
                        ? "Blocked"
                        : "Available"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                    START TIME
                  </span>
                  <p className="font-bold text-gray-800 text-lg">
                    {dayjs(viewSlot.start).format("hh:mm A")}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner-sm">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                    END TIME
                  </span>
                  <p className="font-bold text-gray-800 text-lg">
                    {dayjs(viewSlot.end).format("hh:mm A")}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">
                  PRACTICE DETAILS
                </span>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-800 capitalize">
                    {practiceLocations.find(
                      (pLoc) => pLoc._id === viewSlot.practiceLocationId,
                    )?.name || "Unknown Location"}
                  </p>
                  <span className="text-gray-300">|</span>
                  <p className="font-bold text-gray-800 capitalize flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${viewSlot.mode === "online" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"}`}
                    ></span>
                    {viewSlot.mode}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400/60 text-center p-8 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50 gap-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <Repeat size={32} className="text-gray-300" />
              </div>
              <div>
                <p className="font-bold text-gray-500">No selection</p>
                <p className="text-sm font-medium">
                  Select a slot from the calendar to view details or manage the
                  recurring series.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DViewSlot;
