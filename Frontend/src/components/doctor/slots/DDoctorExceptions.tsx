import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../../state/store";
import {
  getDoctorExceptions,
  createDoctorException,
  deleteDoctorException,
} from "../../../api/doctor/dSlotManagementService";
import toast from "react-hot-toast";
import { Trash2, Calendar, Plus, X } from "lucide-react";
import dayjs from "dayjs";

export default function DDoctorExceptions() {
  const doctorId = useSelector((state: RootState) => state.userInfo.id);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newException, setNewException] = useState({
    reason: "",
    startDatetime: "",
    endDatetime: "",
  });

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
        setShowAddModal(false);
        setNewException({ reason: "", startDatetime: "", endDatetime: "" });
        fetchExceptions();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this holiday/exception?")) return;
    try {
      const data = await deleteDoctorException(id);
      if (data && data.success) {
        toast.success("Exception removed");
        fetchExceptions();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
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
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-darkGreen text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-opacity-90 transition-all font-medium"
        >
          <Plus size={18} /> Add Holiday
        </button>
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
        ) : (
          <div className="grid gap-4">
            {exceptions.map((ex) => (
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
                <button 
                  onClick={() => handleDelete(ex.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center px-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add Holiday/Leave</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
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
                  onClick={() => setShowAddModal(false)}
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
      )}
    </div>
  );
}
