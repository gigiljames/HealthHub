import { useEffect, useState, useCallback } from "react";
import ASidebar from "../../components/admin/ASidebar";
import getIcon from "../../helpers/getIcon";
import ASpecializationModal from "../../components/admin/ASpecializationModal";
import {
  activateSpecialization,
  addSpecialization,
  deActivateSpecialization,
  editSpecialization,
  getSpecializations,
} from "../../api/admin/specializationService";
import toast from "react-hot-toast";
import AMobileSidebar from "../../components/admin/AMobileSidebar";
import AdminTable, { type ColumnDef } from "../../components/admin/AdminTable";
import { X } from "lucide-react";

interface SpecializationData {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function ASpecializationManagement() {
  const [showAddSpecializationModal, setShowAddSpecializationModal] =
    useState(false);
  const [showEditSpecializationModal, setShowEditSpecializationModal] =
    useState(false);
  const [editData, setEditData] = useState({ id: "", name: "", desc: "" });
  const [updateList, setUpdateList] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(1);
  const [totalSpecs, setTotalSpecs] = useState(0);

  const [inputFilters, setInputFilters] = useState({
    search: "",
    sort: "",
  });

  const [filters, setFilters] = useState({ ...inputFilters });

  const [data, setData] = useState<SpecializationData[]>([]);
  document.title = "Specialization Management";

  // Debounce search and filter inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => {
        const hasChanged =
          prev.search !== inputFilters.search ||
          prev.sort !== inputFilters.sort;
        return hasChanged ? inputFilters : prev;
      });
      setCurrentPage((prevPage) => (prevPage !== 1 ? 1 : prevPage));
    }, 800);
    return () => clearTimeout(handler);
  }, [inputFilters]);

  const fetchSpecializations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSpecializations(
        filters.search,
        currentPage,
        10,
        filters.sort
      );
      if (res && res.specializations) {
        setData(res.specializations);
        setTotalSpecs(res.totalDocumentCount || 0);
        const pages = Math.ceil((res.totalDocumentCount || 0) / 10);
        setTotalPageCount(pages || 1);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch specializations");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, updateList]);

  useEffect(() => {
    fetchSpecializations();
  }, [fetchSpecializations]);

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
    };
    setInputFilters(emptyFilters);
    setFilters(emptyFilters);
    setCurrentPage(1);
  };

  async function handleActivate(id: string) {
    const dataRes = await activateSpecialization(id);
    if (dataRes.success) {
      toast.success(dataRes.message ?? "Specialization activated successfully");
      setData((prev) =>
        prev.map((spec) =>
          spec.id === id ? { ...spec, isActive: true } : spec
        )
      );
    } else {
      toast.error(
        dataRes.message ?? "An error occurred while activating specialization"
      );
    }
  }

  async function handleDeactivate(id: string) {
    const dataRes = await deActivateSpecialization(id);
    if (dataRes.success) {
      toast.success(dataRes.message ?? "Specialization de-activated successfully");
      setData((prev) =>
        prev.map((spec) =>
          spec.id === id ? { ...spec, isActive: false } : spec
        )
      );
    } else {
      toast.error(
        dataRes.message ?? "An error occurred while de-activating specialization"
      );
    }
  }

  async function addSpecializationCallback(name: string, desc: string) {
    const dataRes = await addSpecialization(name, desc);
    if (dataRes.success) {
      toast.success(dataRes.message ?? "Specialization added successfully");
      setShowAddSpecializationModal(false);
      const newSpec = dataRes.data?.specialization || dataRes.specialization;
      if (newSpec) {
        setData((prev) => [
          {
            id: newSpec.id || newSpec._id || "",
            name: newSpec.name || name,
            description: newSpec.description || desc,
            isActive: newSpec.isActive !== undefined ? newSpec.isActive : true,
            createdAt: newSpec.createdAt ? new Date(newSpec.createdAt) : new Date(),
            updatedAt: newSpec.updatedAt ? new Date(newSpec.updatedAt) : new Date(),
          },
          ...prev,
        ].slice(0, 10));
        setTotalSpecs((prev) => {
          const nextCount = prev + 1;
          setTotalPageCount(Math.ceil(nextCount / 10) || 1);
          return nextCount;
        });
      }
    } else {
      toast.error(
        dataRes.message ?? "An error occurred while adding specialization"
      );
    }
  }

  async function editSpecializationCallback(name: string, desc: string) {
    const dataRes = await editSpecialization(editData.id, name, desc);
    if (dataRes.success) {
      toast.success(dataRes.message ?? "Specialization updated successfully");
      setShowEditSpecializationModal(false);
      const updatedSpec = dataRes.data?.specialization || dataRes.specialization;
      setData((prev) =>
        prev.map((spec) =>
          spec.id === editData.id
            ? {
                ...spec,
                name: updatedSpec?.name || name,
                description: updatedSpec?.description || desc,
                updatedAt: updatedSpec?.updatedAt ? new Date(updatedSpec.updatedAt) : new Date(),
              }
            : spec
        )
      );
    } else {
      toast.error(
        dataRes.message ?? "An error occurred while updating specialization"
      );
    }
  }

  function handleEditModal(id: string, name: string, desc: string) {
    setEditData({ id, name, desc });
    setShowEditSpecializationModal(true);
  }

  const columns: ColumnDef<SpecializationData>[] = [
    {
      header: "Specialization Name",
      render: (spec) => (
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          {spec.name}
        </div>
      ),
    },
    {
      header: "Description",
      render: (spec) => (
        <div className="text-gray-600 dark:text-gray-300 font-medium max-w-sm xl:max-w-md truncate">
          {spec.description}
        </div>
      ),
    },
    {
      header: "Status",
      render: (spec) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${spec.isActive
            ? "text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-950/40"
            : "text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-950/40"
            }`}
        >
          {spec.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right whitespace-nowrap",
      render: (spec) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-xs font-bold transition-all border border-gray-200 dark:border-gray-700"
            onClick={() => handleEditModal(spec.id, spec.name, spec.description)}
          >
            Edit
          </button>
          {spec.isActive ? (
            <button
              className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900/60 text-xs font-bold transition-all border border-red-200 dark:border-red-800"
              onClick={() => handleDeactivate(spec.id)}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="px-3 py-1 rounded bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900/60 text-xs font-bold transition-all border border-green-200 dark:border-green-800"
              onClick={() => handleActivate(spec.id)}
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {showAddSpecializationModal && (
        <ASpecializationModal
          type="add"
          callback={addSpecializationCallback}
          setShowSpecializationModal={setShowAddSpecializationModal}
        />
      )}
      {showEditSpecializationModal && (
        <ASpecializationModal
          type="edit"
          callback={editSpecializationCallback}
          setShowSpecializationModal={setShowEditSpecializationModal}
          editData={editData}
        />
      )}

      <AMobileSidebar page="specialization-management" />
      <div className="flex w-full flex-col lg:flex-row">
        <ASidebar page="specialization-management" />
        <div className="w-screen lg:flex-1">
          <div className="flex flex-col  p-4 h-screen overflow-y-auto bg-[#f3f4f6] dark:bg-[#1a1c23] min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-200 w-full animate-fade-in pb-10">

            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold">Specialization Management</h1>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-[#5C8D89] text-white font-bold rounded-md hover:opacity-90 shadow-sm transition-all text-sm"
                onClick={() => setShowAddSpecializationModal(true)}
              >
                {getIcon("add", "18px", "white")} Add Specialization
              </button>
            </div>

            {/* Filters Card */}
            <div className="bg-white dark:bg-[#252831] p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
              <div className="flex items-center gap-2 mb-4 text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
                Search &amp; Filters
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      placeholder="Search by specialization name..."
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
                    <option value="alpha-asc">Name (A to Z)</option>
                    <option value="alpha-desc">Name (Z to A)</option>
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
            <AdminTable<SpecializationData>
              columns={columns}
              data={data}
              loading={loading}
              keyExtractor={(spec) => spec.id}
              emptyMessage="No specializations found matching search criteria."
              resultLabel={`${totalSpecs} specializations configured`}
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

export default ASpecializationManagement;
