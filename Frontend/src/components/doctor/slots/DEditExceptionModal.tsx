import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { editDoctorException } from "../../../api/doctor/dSlotManagementService";
import toast from "react-hot-toast";
import { X, AlertTriangle } from "lucide-react";

interface DEditExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exception: {
    id: string;
    reason: string;
    startDatetime: string;
    endDatetime: string;
  } | null;
}

export default function DEditExceptionModal({
  isOpen,
  onClose,
  onSuccess,
  exception,
}: DEditExceptionModalProps) {
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    if (exception) {
      setReason(exception.reason);
      setStartDate(dayjs(exception.startDatetime));
      setStartTime(dayjs(exception.startDatetime));
      setEndDate(dayjs(exception.endDatetime));
      setEndTime(dayjs(exception.endDatetime));
    }
  }, [exception]);

  const getCombinedISOString = (dateVal: dayjs.Dayjs | null, timeVal: dayjs.Dayjs | null) => {
    if (!dateVal || !timeVal) return "";
    return dateVal
      .hour(timeVal.hour())
      .minute(timeVal.minute())
      .second(0)
      .millisecond(0)
      .toISOString();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exception) return;
    try {
      const startDatetime = getCombinedISOString(startDate, startTime);
      const endDatetime = getCombinedISOString(endDate, endTime);

      if (!reason.trim() || !startDatetime || !endDatetime) {
        toast.error("All fields are required");
        return;
      }

      const data = await editDoctorException(exception.id, {
        reason,
        startDatetime,
        endDatetime,
      });

      if (data && data.success) {
        toast.success("Exception updated successfully");
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update exception");
    }
  };

  if (!isOpen) return null;

  const pickerSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "0.75rem",
      backgroundColor: "#ffffff",
      color: "#111827",
      "& fieldset": {
        borderColor: "#e5e7eb",
      },
      ".dark &": {
        backgroundColor: "#1f2937",
        color: "#ffffff",
      },
      ".dark & fieldset": {
        borderColor: "#374151",
      },
      "&:hover fieldset": {
        borderColor: "#006837",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#006837",
      },
    },
    "& .MuiInputBase-input": {
      padding: "8.5px 14px",
    },
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center px-4" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl w-full max-w-lg shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Holiday/Leave</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex gap-2">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Warning:</span> Already booked slots do not get cancelled or blocked, the doctor has to manually cancel them. All available slots will be blocked.
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Reason</label>
              <input
                type="text"
                placeholder="e.g. Personal Leave, Medical Conference"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-darkGreen/20"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Start Date</label>
                <DatePicker
                  value={startDate}
                  disablePast
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: pickerSx,
                    },
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Start Time</label>
                <TimePicker
                  value={startTime}
                  onChange={(newValue) => setStartTime(newValue)}
                  ampm={true}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: pickerSx,
                    },
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">End Date</label>
                <DatePicker
                  value={endDate}
                  minDate={startDate || dayjs()}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: pickerSx,
                    },
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">End Time</label>
                <TimePicker
                  value={endTime}
                  onChange={(newValue) => setEndTime(newValue)}
                  ampm={true}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      sx: pickerSx,
                    },
                  }}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-darkGreen dark:bg-lightGreen/80 text-white rounded-xl font-medium hover:bg-opacity-90 transition-all shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </LocalizationProvider>
    </div>
  );
}
