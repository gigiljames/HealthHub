import { useEffect, useState } from "react";
import ASidebar from "../../components/admin/ASidebar";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import { getWallets } from "../../api/admin/walletService";
import getIcon from "../../helpers/getIcon";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import AdminTable, { type ColumnDef } from "../../components/admin/AdminTable";
import { X } from "lucide-react";

function AWalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWallets, setTotalWallets] = useState(0);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    minBalance: "",
    maxBalance: "",
  });
  const [inputFilters, setInputFilters] = useState({
    search: "",
    role: "",
    minBalance: "",
    maxBalance: "",
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (JSON.stringify(filters) !== JSON.stringify(inputFilters)) {
        setFilters(inputFilters);
        setPage(1);
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [inputFilters, filters]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.minBalance) params.minBalance = filters.minBalance;
      if (filters.maxBalance) params.maxBalance = filters.maxBalance;

      const res = await getWallets(params);
      setWallets(res.data?.wallets || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalWallets(res.data?.totalCount || res.data?.wallets?.length || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load wallets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, [page, filters]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setInputFilters({ ...inputFilters, [e.target.name]: e.target.value });
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      search: "",
      role: "",
      minBalance: "",
      maxBalance: "",
    };
    setInputFilters(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Wallet ID",
      render: (w) => <p className="font-mono text-sm">{w._id}</p>,
    },
    {
      header: "User Profile",
      render: (w) => (
        <>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{w.user?.name || "N/A"}</p>
          <p className="text-xs text-gray-400 mt-0.5">ID: {w.user?._id || "N/A"}</p>
        </>
      ),
    },
    {
      header: "Email Address",
      render: (w) => (
        <span className="text-gray-600 dark:text-gray-300 font-medium">
          {w.user?.email || "N/A"}
        </span>
      ),
    },
    {
      header: "Role Type",
      render: (w) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${w.user?.role === "DOCTOR"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
            }`}
        >
          {w.user?.role || "UNKNOWN"}
        </span>
      ),
    },
    {
      header: "Available Balance",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (w) => (
        <p className="font-bold text-lg text-gray-800 dark:text-gray-200">
          ₹{w.balance ? w.balance.toFixed(2) : "0.00"}
        </p>
      ),
    },
  ];

  return (
    <>
      <AMobileSidebar page="wallets" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="wallets" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-4 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-200 w-full animate-fade-in pb-10">

            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">Wallet Management</h1>
            </div>

            {/* Filters Card */}
            <div className="bg-white dark:bg-[#252831] p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
              <div className="flex items-center gap-2 mb-4 text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
                Search &amp; Filters
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Search Profile
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      value={inputFilters.search}
                      onChange={handleFilterChange}
                      placeholder="Search by User Name, Email, or ID..."
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
                    Account Role
                  </label>
                  <select
                    name="role"
                    value={inputFilters.role}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm text-gray-700 dark:text-gray-300"
                  >
                    <option value="">All Roles</option>
                    <option value="user">Patient (User)</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Min Balance (₹)
                  </label>
                  <input
                    type="number"
                    name="minBalance"
                    value={inputFilters.minBalance}
                    onChange={handleFilterChange}
                    placeholder="Min Amount"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Max Balance (₹)
                  </label>
                  <input
                    type="number"
                    name="maxBalance"
                    value={inputFilters.maxBalance}
                    onChange={handleFilterChange}
                    placeholder="Max Amount"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen transition-all text-sm text-gray-800 dark:text-gray-200"
                  />
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
            <AdminTable<any>
              columns={columns}
              data={wallets}
              loading={loading}
              keyExtractor={(w) => w._id}
              onRowClick={(w) => navigate(`/admin/wallets/${w._id}`)}
              emptyMessage="No wallets found matching filters."
              resultLabel={`${totalWallets} wallets found`}
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
}

export default AWalletsPage;
