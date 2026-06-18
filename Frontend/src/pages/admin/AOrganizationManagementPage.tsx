import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import ASidebar from "../../components/admin/ASidebar";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import AdminTable, { type ColumnDef } from "../../components/admin/AdminTable";
import { adminListOrganizations } from "../../api/organization/organizationService";
import getIcon from "../../helpers/getIcon";
import toast from "react-hot-toast";

function AOrganizationManagementPage() {
  document.title = "Organization Management - Admin";
  const navigate = useNavigate();

  // Search, Filter, Pagination state
  const [inputFilters, setInputFilters] = useState({
    search: "",
    type: "",
    status: "",
    block: "",
  });

  const [filters, setFilters] = useState({ ...inputFilters });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const [totalOrgCount, setTotalOrgCount] = useState(0);
  const [limit] = useState(10);

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Debouncing effect for search and filter changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters(inputFilters);
      setCurrentPage(1);
    }, 600);
    return () => clearTimeout(handler);
  }, [inputFilters]);

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    const params: any = {
      page: currentPage,
      limit,
      search: filters.search.trim() || undefined,
      organizationType: filters.type || undefined,
      verificationStatus: filters.status || undefined,
      isBlocked: filters.block === "blocked" ? true : filters.block === "active" ? false : undefined,
    };

    try {
      const response = await adminListOrganizations(params);
      if (response?.success) {
        setOrganizations(response.organizations || []);
        setTotalPageCount(response.pages || 1);
        setTotalOrgCount(response.total || 0);
      } else {
        toast.error(response?.message || "Failed to load organizations.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading organizations.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, limit]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInputFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setInputFilters({
      search: "",
      type: "",
      status: "",
      block: "",
    });
    setCurrentPage(1);
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Name",
      render: (org) => (
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {org.name}
        </span>
      ),
    },
    {
      header: "Email",
      render: (org) => (
        <span className="text-gray-600 dark:text-gray-300">
          {org.email}
        </span>
      ),
    },
    {
      header: "Type",
      render: (org) => (
        <span
          className={`px-2 py-1 rounded text-[10px] font-bold ${org.organizationType === "HOSPITAL"
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              : "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
            }`}
        >
          {org.organizationType}
        </span>
      ),
    },
    {
      header: "Status",
      render: (org) => {
        const getStatusBadge = (status: string) => {
          switch (status) {
            case "VERIFIED":
              return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400";
            case "REJECTED":
              return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400";
            default:
              return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400";
          }
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${getStatusBadge(
              org.verificationStatus
            )}`}
          >
            {org.verificationStatus}
          </span>
        );
      },
    },
    {
      header: "State",
      render: (org) => (
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${org.isBlocked
              ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              : "bg-emerald-50 text-emerald-650 dark:bg-emerald-900/20 dark:text-emerald-400"
            }`}
        >
          {org.isBlocked ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      header: "Code",
      render: (org) => (
        <span className="font-mono font-bold text-gray-600 dark:text-gray-300 tracking-wider">
          {org.organizationCode || "-"}
        </span>
      ),
    },
    {
      header: "Created At",
      render: (org) => (
        <span className="text-gray-400">
          {new Date(org.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <>
      <AMobileSidebar page="hospital-management" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="hospital-management" />
        <div className="w-screen lg:flex-1 relative">
          <div className="flex flex-col gap-4 p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] text-gray-800 dark:text-gray-200 transition-colors duration-200 animate-fade-in pb-10">

            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold">Organization Management</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalOrgCount} organizations found
              </span>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#252831] p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Search &amp; Filters
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Search */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search name, bank, code..."
                    value={inputFilters.search}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen text-sm text-gray-800 dark:text-gray-200"
                  />
                </div>

                {/* Org Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Org Type
                  </label>
                  <select
                    name="type"
                    value={inputFilters.type}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen text-sm text-gray-800 dark:text-gray-200"
                  >
                    <option value="">All Types</option>
                    <option value="HOSPITAL">Hospital</option>
                    <option value="CLINIC">Clinic</option>
                    <option value="DIAGNOSTIC_CENTER">Diagnostic Center</option>
                    <option value="PHARMACY">Pharmacy</option>
                  </select>
                </div>

                {/* Verification Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Verification Status
                  </label>
                  <select
                    name="status"
                    value={inputFilters.status}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen text-sm text-gray-855 dark:text-gray-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                {/* Account State */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Account State
                  </label>
                  <select
                    name="block"
                    value={inputFilters.block}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#1a1c23] border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-lightGreen text-sm text-gray-855 dark:text-gray-200"
                  >
                    <option value="">All States</option>
                    <option value="active">Active (Unblocked)</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1c23] dark:hover:bg-slate-800 text-gray-650 dark:text-gray-300 text-xs font-semibold rounded-md transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Table */}
            <AdminTable<any>
              columns={columns}
              data={organizations}
              loading={loading}
              keyExtractor={(org) => org.id}
              onRowClick={(org) => navigate(`/admin/hospital-management/${org.id}`)}
              emptyMessage="No organizations found matching your criteria."
              pagination={{
                page: currentPage,
                totalPages: totalPageCount,
                onPrev: () => setCurrentPage((p) => Math.max(1, p - 1)),
                onNext: () => setCurrentPage((p) => Math.min(totalPageCount, p + 1)),
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default AOrganizationManagementPage;
