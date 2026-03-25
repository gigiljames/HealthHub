import { useEffect, useState } from "react";
import ASidebar from "../../components/admin/ASidebar";
import { getWallets } from "../../api/admin/walletService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import AdminTable, { type ColumnDef } from "../../components/admin/AdminTable";

function AWalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
    }, 500);
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setInputFilters({ ...inputFilters, [e.target.name]: e.target.value });
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Wallet ID",
      render: (w) => <p className="font-semibold text-gray-900">{w._id}</p>,
    },
    {
      header: "User Profile",
      render: (w) => (
        <>
          <p className="font-medium text-gray-800">{w.user?.name || "N/A"}</p>
          <p className="text-xs text-gray-500 mt-1">{w.user?.email || "N/A"}</p>
          <p className="text-xs text-gray-400 mt-1">
            ID: {w.user?._id || "N/A"}
          </p>
        </>
      ),
    },
    {
      header: "Role",
      render: (w) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            w.user?.role === "DOCTOR"
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
          }`}
        >
          {w.user?.role || "UNKNOWN"}
        </span>
      ),
    },
    {
      header: "Balance",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (w) => (
        <p className="font-bold text-gray-900">₹{w.balance.toFixed(2)}</p>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <ASidebar page="wallets" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-inputBorder shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-xl font-bold">Wallets</h3>
              </div>

              {/* Filters */}
              <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="search"
                    value={inputFilters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by User Name, Email, or ID..."
                    className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none"
                  />
                </div>
                <div>
                  <select
                    name="role"
                    value={inputFilters.role}
                    onChange={handleFilterChange}
                    className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none text-gray-700 bg-white"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    name="minBalance"
                    value={inputFilters.minBalance}
                    onChange={handleFilterChange}
                    placeholder="Min Balance"
                    className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="maxBalance"
                    value={inputFilters.maxBalance}
                    onChange={handleFilterChange}
                    placeholder="Max Balance"
                    className="w-full border border-inputBorder rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-darkGreen outline-none bg-white"
                  />
                </div>
              </div>

              {/* Table */}
              <AdminTable<any>
                columns={columns}
                data={wallets}
                loading={loading}
                keyExtractor={(w) => w._id}
                onRowClick={(w) => navigate(`/admin/wallets/${w._id}`)}
                emptyMessage="No wallets found."
                pagination={
                  !loading
                    ? {
                        page,
                        totalPages,
                        onPrev: () => setPage((p) => p - 1),
                        onNext: () => setPage((p) => p + 1),
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AWalletsPage;
