import { useEffect, useState } from "react";
import ASidebar from "../../components/admin/ASidebar";
import AHeader from "../../components/admin/AHeader";
import { getWallets } from "../../api/admin/walletService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

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

  return (
    <div className="flex h-screen bg-slate-50">
      <ASidebar page="wallets" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* <AHeader title="Wallet Management" /> */}

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
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-darkGreen"></div>
                  </div>
                ) : wallets.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 text-sm">
                    <p>No wallets found.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-medium">Wallet ID</th>
                        <th className="px-6 py-4 font-medium">User Profile</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                        <th className="px-6 py-4 font-medium text-right">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {wallets.map((w) => (
                        <tr
                          key={w._id}
                          onClick={() => navigate(`/admin/wallets/${w._id}`)}
                          className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">
                              {w._id}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-800">
                              {w.user?.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {w.user?.email || "N/A"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              ID: {w.user?._id || "N/A"}
                            </p>
                          </td>
                          <td className="px-6 py-4 flex items-center h-full pt-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                w.user?.role === "DOCTOR"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {w.user?.role || "UNKNOWN"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-bold text-gray-900">
                              ₹{w.balance.toFixed(2)}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AWalletsPage;
