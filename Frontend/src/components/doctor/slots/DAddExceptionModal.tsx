import React, { useState } from "react";
import { createDoctorException } from "../../../api/doctor/dSlotManagementService";
import toast from "react-hot-toast";
import { X, AlertTriangle } from "lucide-react";

interface DAddExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DAddExceptionModal({
  isOpen,
  onClose,
  onSuccess,
}: DAddExceptionModalProps) {
  const [newException, setNewException] = useState({
    reason: "",
    startDatetime: "",
    endDatetime: "",
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newException.reason || !newException.startDatetime || !newException.endDatetime) {
        toast.error("All fields are required");
        return;
      }
      const data = await createDoctorException(newException);
      if (data && data.success) {
        toast.success("Exception added successfully");
        setNewException({ reason: "", startDatetime: "", endDatetime: "" });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add exception");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center px-4" onClick={onClose}>
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Add Holiday/Leave</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Warning:</span> Already booked slots do not get cancelled or blocked, the doctor has to manually cancel them. All available slots will be blocked.
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reason</label>
            <input
              type="text"
              placeholder="e.g. Personal Leave, Medical Conference"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-darkGreen/20"
              value={newException.reason}
              onChange={e => setNewException({...newException, reason: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Datetime</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-darkGreen/20"
                value={newException.startDatetime}
                onChange={e => setNewException({...newException, startDatetime: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Datetime</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-darkGreen/20"
                value={newException.endDatetime}
                onChange={e => setNewException({...newException, endDatetime: e.target.value})}
              />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-darkGreen text-white rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-sm"
            >
              Save Exception
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
