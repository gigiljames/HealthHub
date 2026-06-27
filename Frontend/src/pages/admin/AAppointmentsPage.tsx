import { useEffect, useState, useCallback } from "react";
import { getAdminAppointments } from "../../api/admin/adminAppointmentService";
import { useNavigate } from "react-router";
import getIcon from "../../helpers/getIcon";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
import AdminTable, { type ColumnDef } from "../../components/admin/AdminTable";

const PaymentStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  INITIATED: "INITIATED",
  REFUNDED: "REFUNDED",
} as const;

const AppointmentStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  CONFIRMED: "CONFIRMED",
  RESCHEDULE_PENDING: "RESCHEDULE_PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  CANCELLED_BY_DOCTOR: "CANCELLED_BY_DOCTOR",
  CANCELLED_BY_USER: "CANCELLED_BY_USER",
  NO_SHOW: "NO_SHOW",
} as const;

const ConsultationMode = {
  ONLINE: "online",
  IN_PERSON: "in-person",
} as const;

const getStatusColor = (status: string) => {
  switch (status) {
    case AppointmentStatus.COMPLETED:
      return "text-green-600 bg-green-100";
    case AppointmentStatus.PENDING_PAYMENT:
      return "text-yellow-600 bg-yellow-100";
    case AppointmentStatus.CONFIRMED:
      return "text-blue-600 bg-blue-100";
    case AppointmentStatus.RESCHEDULE_PENDING:
      return "text-amber-600 bg-amber-100 font-semibold";
    case AppointmentStatus.NO_SHOW:
    case AppointmentStatus.CANCELLED:
    case AppointmentStatus.CANCELLED_BY_DOCTOR:
    case AppointmentStatus.CANCELLED_BY_USER:
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case PaymentStatus.SUCCESS:
      return "text-green-600 bg-green-100";
    case PaymentStatus.FAILED:
      return "text-red-600 bg-red-100";
    case PaymentStatus.INITIATED:
      return "text-yellow-600 bg-yellow-100";
    case PaymentStatus.REFUNDED:
      return "text-blue-600 bg-blue-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const AAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [inputFilters, setInputFilters] = useState({
    search: "",
    status: "",
    paymentStatus: "",
    mode: "",
    sort: "newest",
    startDate: "",
    endDate: "",
  });

  const [filters, setFilters] = useState({ ...inputFilters });

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(inputFilters);
      setPage(1);
    }, 1000);
    return () => clearTimeout(handler);
  }, [inputFilters]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminAppointments({ ...filters, page, limit });
      setAppointments(data.appointments || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setInputFilters((prev) => ({ ...prev, [name]: value }));
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Appt ID & Mode",
      render: (appt) => (
        <>
          <div className="font-mono text-sm">{appt.id}</div>
          <div className="text-xs text-gray-500 mt-1 uppercase font-semibold">
            {appt.mode === "online" ? "🟢 Online" : "🏢 In-Person"}
          </div>
        </>
      ),
    },
    {
      header: "Patient & Doctor",
      render: (appt) => (
        <>
          <div className="text-sm font-semibold">
            <span className="text-gray-500 dark:text-gray-400 text-xs mr-1">
              Pt:
            </span>
            {appt.patientName || "Unknown"}
          </div>
          <div className="text-sm font-semibold mt-1">
            <span className="text-gray-500 dark:text-gray-400 text-xs mr-1">
              Dr:
            </span>
            {appt.doctorName || "Unknown"}
          </div>
        </>
      ),
    },
    {
      header: "Appt Date",
      cellClassName:
        "text-sm whitespace-nowrap text-gray-600 dark:text-gray-300",
      render: (appt) => (
        <>
          <div>
            {new Date(appt.appointmentDate).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(appt.appointmentDate).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </>
      ),
    },
    {
      header: "Booking Date",
      cellClassName:
        "text-sm whitespace-nowrap text-gray-600 dark:text-gray-300",
      render: (appt) => (
        <>
          <div>
            {new Date(appt.bookingDate).toLocaleDateString(undefined, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(appt.bookingDate).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </>
      ),
    },
    {
      header: "Appt Status",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (appt) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${getStatusColor(appt.status)}`}
        >
          {appt.status.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      header: "Payment Status",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (appt) =>
        appt.transactionStatus ? (
          <span
            className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${getPaymentStatusColor(appt.transactionStatus)}`}
          >
            {appt.transactionStatus}
          </span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
    {
      header: "Amount",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (appt) => (
        <div className="font-bold text-gray-800 dark:text-gray-200 text-lg">
          ₹{appt.amount ? appt.amount.toFixed(2) : "0.00"}
        </div>
      ),
    },
  ];

  return (
    <>
      <AMobileSidebar page="appointments" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="appointments" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-2 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-200 w-full animate-fade-in pb-10">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Appointment Management</h1>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#252831] p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
              <div className="flex items-center gap-2 mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                Search &amp; Filters
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    name="search"
                    placeholder="Appt ID, Dr/Pt Name, Email, Txn ID..."
                    value={inputFilters.search}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Sort By
                  </label>
                  <select
                    name="sort"
                    value={inputFilters.sort}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  >
                    <option value="appointment-desc">
                      Appt Date (Newest first)
                    </option>
                    <option value="appointment-asc">
                      Appt Date (Oldest first)
                    </option>
                    <option value="booking-desc">
                      Booking Date (Newest first)
                    </option>
                    <option value="booking-asc">
                      Booking Date (Oldest first)
                    </option>
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Appt Status
                  </label>
                  <select
                    name="status"
                    value={inputFilters.status}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  >
                    <option value="">All Statuses</option>
                    {Object.values(AppointmentStatus).map((status) => (
                      <option key={status as string} value={status as string}>
                        {status as string}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Payment Status
                  </label>
                  <select
                    name="paymentStatus"
                    value={inputFilters.paymentStatus}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  >
                    <option value="">All Payments</option>
                    {Object.values(PaymentStatus).map((status) => (
                      <option key={status as string} value={status as string}>
                        {status as string}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Mode
                  </label>
                  <select
                    name="mode"
                    value={inputFilters.mode}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                  >
                    <option value="">All Modes</option>
                    {Object.values(ConsultationMode).map((md) => (
                      <option key={md as string} value={md as string}>
                        {(md as string) === "online" ? "Online" : "In-Person"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 lg:col-span-2">
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Appt Date From
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={inputFilters.startDate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Appt Date To
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={inputFilters.endDate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <AdminTable<any>
              columns={columns}
              data={appointments}
              loading={loading}
              keyExtractor={(appt) => appt.id}
              onRowClick={(appt) => navigate(`/admin/appointments/${appt.id}`)}
              emptyMessage="No appointments found matching your criteria."
              resultLabel={`${total} appointments found`}
              pagination={{
                page,
                totalPages,
                onPrev: () => setPage((p) => Math.max(1, p - 1)),
                onNext: () => setPage((p) => Math.min(totalPages, p + 1)),
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AAppointmentsPage;
