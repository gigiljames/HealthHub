import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import ASidebar from "../../components/admin/ASidebar";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import { getAdminPayouts } from "../../api/payoutService";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import getIcon from "../../helpers/getIcon";

const PAYOUT_STATUSES = ["PENDING", "PROCESSED", "FAILED"];

const APayoutsPage = () => {
  const navigate = useNavigate();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [inputFilters, setInputFilters] = useState({
    search: "",
    status: "",
    specialization: "",
    sort: "date-desc",
    startDate: "",
    endDate: "",
  });

  const [filters, setFilters] = useState({ ...inputFilters });

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(inputFilters);
      setPage(1);
    }, 600);
    return () => clearTimeout(handler);
  }, [inputFilters]);

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      const [sortBy, sortOrder] = filters.sort.split("-");
      const data = await getAdminPayouts({
        search: filters.search || undefined,
        status: filters.status || undefined,
        specialization: filters.specialization || undefined,
        sortBy,
        sortOrder,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page,
        limit,
      });
      if (data.success) {
        setPayouts(data.data.payouts || []);
        setTotal(data.data.total || 0);
        setTotalPages(data.data.totalPages || 1);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch payouts");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setInputFilters((prev) => ({ ...prev, [name]: value }));
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "PROCESSED":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "FAILED":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <>
      <AMobileSidebar page="payouts" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="payouts" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-4 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] text-gray-800 dark:text-gray-200 transition-colors duration-200 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold">Payout Management</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {total} payouts found
              </span>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#252831] p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {getIcon("filter", "14px")}
                Filters & Search
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Search */}
                <div className="xl:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    name="search"
                    placeholder="Doctor name, email, payout ID, transaction ID..."
                    value={inputFilters.search}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen text-sm"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Payout Status
                  </label>
                  <select
                    name="status"
                    value={inputFilters.status}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen text-sm"
                  >
                    <option value="">All Statuses</option>
                    {PAYOUT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Sort By
                  </label>
                  <select
                    name="sort"
                    value={inputFilters.sort}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen text-sm"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                    <option value="appointments-desc">Most Appointments</option>
                    <option value="appointments-asc">
                      Fewest Appointments
                    </option>
                  </select>
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    placeholder="e.g. Cardiologist"
                    value={inputFilters.specialization}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen text-sm"
                  />
                </div>

                {/* Date Range */}
                <div className="flex gap-2 md:col-span-2">
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Date From
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={inputFilters.startDate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen text-sm"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Date To
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={inputFilters.endDate}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#252831] rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-[#1f2128] text-gray-600 dark:text-gray-400 text-sm font-medium border-b border-gray-100 dark:border-gray-800">
                      <th className="px-5 py-4">Payout ID</th>
                      <th className="px-5 py-4">Doctor</th>
                      <th className="px-5 py-4">Payout Date</th>
                      <th className="px-5 py-4 text-center">Appts</th>
                      <th className="px-5 py-4 text-right">Gross</th>
                      <th className="px-5 py-4 text-right">Net Amount</th>
                      <th className="px-5 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lightGreen"></div>
                          </div>
                        </td>
                      </tr>
                    ) : payouts.length > 0 ? (
                      payouts.map((p) => (
                        <tr
                          key={p._id}
                          className="hover:bg-gray-50 dark:hover:bg-[#1d1f26] cursor-pointer transition-colors"
                          onClick={() => navigate(`/admin/payouts/${p._id}`)}
                        >
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                              {p._id}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                              {p.doctor?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {p.doctor?.email}
                            </p>
                            {p.doctor?.specialization && (
                              <p className="text-xs text-indigo-500 mt-0.5">
                                {p.doctor.specialization}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm text-gray-700 dark:text-gray-200">
                              {dayjs(p.createdAt).format("MMM D, YYYY")}
                            </p>
                            <p className="text-xs text-gray-400">
                              {dayjs(p.createdAt).format("h:mm A")}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-semibold">
                              {p.appointmentsCount ??
                                p.appointmentIds?.length ??
                                0}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ${p.grossAmount?.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="font-bold text-gray-800 dark:text-gray-100">
                              ${p.amount?.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${getStatusBadge(p.status)}`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-gray-300 dark:text-gray-600">
                              {getIcon("search-solid", "40px")}
                            </span>
                            <p>No payouts found matching your criteria.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm border-gray-200 dark:border-gray-700"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm border-gray-200 dark:border-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default APayoutsPage;
