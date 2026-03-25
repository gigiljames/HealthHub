import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import ASidebar from "../../components/admin/ASidebar";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import { getAdminPayouts } from "../../api/payoutService";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import getIcon from "../../helpers/getIcon";
import AdminTable, { type ColumnDef } from "../../components/admin/AdminTable";

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

  const columns: ColumnDef<any>[] = [
    {
      header: "Payout ID",
      render: (p) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
          {p._id}
        </span>
      ),
    },
    {
      header: "Doctor",
      render: (p) => (
        <>
          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
            {p.doctor?.name || "Unknown"}
          </p>
          <p className="text-xs text-gray-400">{p.doctor?.email}</p>
          {p.doctor?.specialization && (
            <p className="text-xs text-indigo-500 mt-0.5">
              {p.doctor.specialization}
            </p>
          )}
        </>
      ),
    },
    {
      header: "Payout Date",
      render: (p) => (
        <>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {dayjs(p.createdAt).format("MMM D, YYYY")}
          </p>
          <p className="text-xs text-gray-400">
            {dayjs(p.createdAt).format("h:mm A")}
          </p>
        </>
      ),
    },
    {
      header: "Appts",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (p) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-semibold">
          {p.appointmentsCount ?? p.appointmentIds?.length ?? 0}
        </span>
      ),
    },
    {
      header: "Gross",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (p) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          ₹{p.grossAmount?.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Net Amount",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (p) => (
        <span className="font-bold text-gray-800 dark:text-gray-100">
          ₹{p.amount?.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (p) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${getStatusBadge(p.status)}`}
        >
          {p.status}
        </span>
      ),
    },
  ];

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
                Filters &amp; Search
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                    <option value="appointments-asc">Fewest Appointments</option>
                  </select>
                </div>
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
            <AdminTable<any>
              columns={columns}
              data={payouts}
              loading={loading}
              keyExtractor={(p) => p._id}
              onRowClick={(p) => navigate(`/admin/payouts/${p._id}`)}
              emptyMessage="No payouts found matching your criteria."
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

export default APayoutsPage;
