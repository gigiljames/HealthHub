import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  blockDoctor,
  getDoctors,
  unblockDoctor,
} from "../../api/admin/doctorService";
import toast from "react-hot-toast";
import ConfirmationModal from "../common/ConfirmationModal";
import AdminTable, { type ColumnDef } from "./AdminTable";
import { X } from "lucide-react";

interface DoctorData {
  id: string;
  name: string;
  email: string;
  specialization: string;
  isBlocked: boolean;
  isNewUser: boolean;
  isVerified: boolean;
}

function AManageDoctors() {
  const navigate = useNavigate();
  const [totalPageCount, setTotalPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalDoctors, setTotalDoctors] = useState(0);

  const [inputFilters, setInputFilters] = useState({
    search: "",
    sort: "",
    status: "", // "blocked", "active", ""
    profileStatus: "", // "new", "completed", ""
  });

  const [filters, setFilters] = useState({ ...inputFilters });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    doctorId: string;
    action: "block" | "unblock";
    doctorName: string;
  }>({
    isOpen: false,
    doctorId: "",
    action: "block",
    doctorName: "",
  });

  // Debounce search and filter inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => {
        const hasChanged =
          prev.search !== inputFilters.search ||
          prev.sort !== inputFilters.sort ||
          prev.status !== inputFilters.status ||
          prev.profileStatus !== inputFilters.profileStatus;
        return hasChanged ? inputFilters : prev;
      });
      setCurrentPage((prevPage) => (prevPage !== 1 ? 1 : prevPage));
    }, 800);
    return () => clearTimeout(handler);
  }, [inputFilters]);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const isBlockedParam = filters.status === "blocked" ? true : undefined;
      const isUnblockedParam = filters.status === "active" ? true : undefined;
      const isNewUserParam = filters.profileStatus === "new" ? true : filters.profileStatus === "completed" ? false : undefined;

      const response = await getDoctors(
        filters.search,
        currentPage,
        10,
        filters.sort,
        isBlockedParam,
        isUnblockedParam,
        isNewUserParam
      );

      if (response && response.doctors) {
        setDoctorsData(response.doctors);
        setTotalDoctors(response.totalDocumentCount || 0);
        const pages = Math.ceil((response.totalDocumentCount || 0) / 10);
        setTotalPageCount(pages || 1);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const [doctorsData, setDoctorsData] = useState<DoctorData[]>([]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInputFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      search: "",
      sort: "",
      status: "",
      profileStatus: "",
    };
    setInputFilters(emptyFilters);
    setFilters(emptyFilters);
    setCurrentPage(1);
  };

  async function handleBlockDoctor(id: string) {
    try {
      const data = await blockDoctor(id);
      if (data.success) {
        toast.success(data.message ?? "Doctor blocked successfully");
        setDoctorsData((prevDocs) =>
          prevDocs.map((d) => (d.id === id ? { ...d, isBlocked: true } : d))
        );
      } else {
        toast.error(data.message ?? "An error occurred while blocking doctor");
      }
    } catch (err: any) {
      toast.error("Failed to block doctor");
    } finally {
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  }

  async function handleUnblockDoctor(id: string) {
    try {
      const data = await unblockDoctor(id);
      if (data.success) {
        toast.success(data.message ?? "Doctor unblocked successfully");
        setDoctorsData((prevDocs) =>
          prevDocs.map((d) => (d.id === id ? { ...d, isBlocked: false } : d))
        );
      } else {
        toast.error(data.message ?? "An error occurred while unblocking doctor");
      }
    } catch (err: any) {
      toast.error("Failed to unblock doctor");
    } finally {
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  }

  const columns: ColumnDef<DoctorData>[] = [
    {
      header: "Doctor Details",
      render: (doc) => (
        <>
          <div className="font-semibold text-gray-900 dark:text-gray-100">
            {doc.name}
          </div>
          <div className="text-xs text-blue-500 font-semibold mt-0.5">
            {doc.specialization || "General Practice"}
          </div>
        </>
      ),
    },
    {
      header: "Email Address",
      render: (doc) => (
        <div className="text-gray-600 dark:text-gray-300 font-medium">
          {doc.email}
        </div>
      ),
    },
    {
      header: "Account Status",
      render: (doc) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${doc.isBlocked
            ? "text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-950/40"
            : "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-950/40"
            }`}
        >
          {doc.isBlocked ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      header: "Profile Setup",
      render: (doc) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${doc.isNewUser
            ? "text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-950/40"
            : "text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-950/40"
            }`}
        >
          {doc.isNewUser ? "New User" : "Completed"}
        </span>
      ),
    },
    {
      header: "Verification",
      render: (doc) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${doc.isVerified
            ? "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-950/40"
            : "text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/40"
            }`}
        >
          {doc.isVerified ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (doc) =>
        doc.isBlocked ? (
          <button
            className="px-3 py-1 rounded-md bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900/60 text-xs font-bold transition-all border border-green-200 dark:border-green-800"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmModal({
                isOpen: true,
                doctorId: doc.id,
                action: "unblock",
                doctorName: doc.name,
              });
            }}
          >
            Unblock
          </button>
        ) : (
          <button
            className="px-3 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900/60 text-xs font-bold transition-all border border-red-200 dark:border-red-800"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmModal({
                isOpen: true,
                doctorId: doc.id,
                action: "block",
                doctorName: doc.name,
              });
            }}
          >
            Block
          </button>
        ),
    },
  ];

  return (
    <>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() =>
          confirmModal.action === "block"
            ? void handleBlockDoctor(confirmModal.doctorId)
            : void handleUnblockDoctor(confirmModal.doctorId)
        }
        title={
          confirmModal.action === "block" ? "Block Doctor" : "Unblock Doctor"
        }
        message={
          confirmModal.action === "block"
            ? `Are you sure you want to block Dr. ${confirmModal.doctorName}? They will not be able to access the platform.`
            : `Are you sure you want to unblock Dr. ${confirmModal.doctorName}? They will regain access to the platform.`
        }
        confirmText={confirmModal.action === "block" ? "Block" : "Unblock"}
        isDestructive={confirmModal.action === "block"}
      />

      <div className="w-full">
        {/* Filters Card */}
        <div className="bg-white dark:bg-[#252831] p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
            Filters &amp; Search
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  placeholder="Search by doctor name, email..."
                  value={inputFilters.search}
                  onChange={handleFilterChange}
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm text-gray-800 dark:text-gray-200"
                />
                {inputFilters.search && (
                  <button
                    type="button"
                    onClick={() => setInputFilters((prev) => ({ ...prev, search: "" }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Sort Name
              </label>
              <select
                name="sort"
                value={inputFilters.sort}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm text-gray-700 dark:text-gray-300"
              >
                <option value="">None</option>
                <option value="name-asc">Name (A to Z)</option>
                <option value="name-desc">Name (Z to A)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Account Status
              </label>
              <select
                name="status"
                value={inputFilters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm text-gray-700 dark:text-gray-300"
              >
                <option value="">All Accounts</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Profile Status
              </label>
              <select
                name="profileStatus"
                value={inputFilters.profileStatus}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm text-gray-700 dark:text-gray-300"
              >
                <option value="">All Doctors</option>
                <option value="new">New Users Only</option>
                <option value="completed">Profile Completed Only</option>
              </select>
            </div>
            <div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-md text-sm transition-all shadow-sm border border-transparent cursor-pointer text-center"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <AdminTable<DoctorData>
          columns={columns}
          data={doctorsData}
          loading={loading}
          keyExtractor={(doctor) => doctor.id}
          onRowClick={(doctor) => navigate(`/admin/doctor-management/${doctor.id}`)}
          emptyMessage="No doctors found matching your criteria."
          resultLabel={`${totalDoctors} doctors registered`}
          pagination={{
            page: currentPage,
            totalPages: totalPageCount,
            onPrev: () => setCurrentPage((p) => Math.max(1, p - 1)),
            onNext: () => setCurrentPage((p) => Math.min(totalPageCount, p + 1)),
          }}
        />
      </div>
    </>
  );
}

export default AManageDoctors;
