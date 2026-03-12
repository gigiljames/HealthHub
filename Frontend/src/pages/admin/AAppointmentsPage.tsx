import { useEffect, useState, useCallback } from "react";
import { getAdminAppointments } from "../../api/admin/adminAppointmentService";
import { useNavigate } from "react-router";
import getIcon from "../../helpers/getIcon";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import ASidebar from "../../components/admin/ASidebar";
const PaymentStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  INITIATED: "INITIATED",
  REFUNDED: "REFUNDED",
} as const;

const AppointmentStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  CONFIRMED: "CONFIRMED",
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

  // When sort changes from the select, we don't necessarily need a 1s delay,
  // but since it's in inputFilters, it will wait 1s. That's consistent.

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
    setInputFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return "text-green-600 bg-green-100";
      case AppointmentStatus.PENDING_PAYMENT:
        return "text-yellow-600 bg-yellow-100";
      case AppointmentStatus.CONFIRMED:
        return "text-blue-600 bg-blue-100";
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

            {/* Modern Filter Section */}
            <div className="bg-white dark:bg-[#252831] p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
              <div className="flex items-center gap-2 mb-4 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                {getIcon("filter", "16px")}
                Filters & Search
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

            {/* Table Section */}
            <div className="bg-white dark:bg-[#252831] rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 ">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="font-semibold text-lg">
                  Results{" "}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({total} appointments found)
                  </span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#1f2128] text-gray-600 dark:text-gray-400 text-sm font-medium border-b border-gray-100 dark:border-gray-800">
                      <th className="px-6 py-4">Appt ID & Mode</th>
                      <th className="px-6 py-4">Patient & Doctor</th>
                      <th className="px-6 py-4">Appt Date</th>
                      <th className="px-6 py-4">Booking Date</th>
                      <th className="px-6 py-4 text-center">Appt Status</th>
                      <th className="px-6 py-4 text-center">Payment Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lightGreen"></div>
                          </div>
                        </td>
                      </tr>
                    ) : appointments.length > 0 ? (
                      appointments.map((appt) => (
                        <tr
                          key={appt.id}
                          onClick={() =>
                            navigate(`/admin/appointments/${appt.id}`)
                          }
                          className="hover:bg-gray-50 dark:hover:bg-[#1d1f26] cursor-pointer transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm">{appt.id}</div>
                            <div className="text-xs text-gray-500 mt-1 uppercase font-semibold">
                              {appt.mode === "online"
                                ? "🟢 Online"
                                : "🏢 In-Person"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
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
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                            <div>
                              {new Date(
                                appt.appointmentDate,
                              ).toLocaleDateString(undefined, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(
                                appt.appointmentDate,
                              ).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                            <div>
                              {new Date(appt.bookingDate).toLocaleDateString(
                                undefined,
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(appt.bookingDate).toLocaleTimeString(
                                undefined,
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${getStatusColor(appt.status)}`}
                            >
                              {appt.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {appt.transactionStatus ? (
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${getPaymentStatusColor(appt.transactionStatus)}`}
                              >
                                {appt.transactionStatus}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                              ${appt.amount ? appt.amount.toFixed(2) : "0.00"}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-gray-300 dark:text-gray-600 mb-2">
                              {getIcon("search-solid", "40px")}
                            </span>
                            <p>No appointments found matching your criteria.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:hover:bg-transparent transition-colors text-sm font-medium border-gray-200 dark:border-gray-700"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:hover:bg-transparent transition-colors text-sm font-medium border-gray-200 dark:border-gray-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AAppointmentsPage;
