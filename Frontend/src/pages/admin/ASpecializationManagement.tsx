import { useEffect, useRef, useState } from "react";
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
import PaginationBar from "../../components/common/PaginationBar";

interface SpecializationData {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function ASpecializationManagement() {
  // const currentPageBox = document.getElementById("currentPageBox");
  const [showAddSpecializationModal, setShowAddSpecializationModal] =
    useState(false);
  const [showEditSpecializationModal, setShowEditSpecializationModal] =
    useState(false);
  const [editData, setEditData] = useState({ id: "", name: "", desc: "" });
  const [updateList, setUpdateList] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [limit] = useState(9);
  const [totalPageCount, setTotalPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<SpecializationData[] | null>(null);
  document.title = "Specialization management";

  useEffect(() => {
    getSpecializations(searchRef.current?.value ?? "", currentPage, limit, sort)
      .then((data) => {
        // console.log(data);
        setData(data.specializations);
        const totalPageCount = Math.ceil(data.totalDocumentCount / limit);
        setTotalPageCount(totalPageCount);
      })
      .catch((error) => {
        toast.error(error);
      });
  }, [updateList, currentPage, limit, sort]);

  function handleSearchClear() {
    if (searchRef.current) searchRef.current.value = "";
    setSearch("");
    setUpdateList(updateList + 1);
  }

  async function handleActivate(id: string) {
    const data = await activateSpecialization(id);
    if (data.success) {
      toast.success(data.message ?? "Specialization activated successfully");
      setUpdateList((prev) => prev + 1);
    } else {
      toast.error(
        data.message ?? "An error occured while activating specialization"
      );
    }
  }

  async function handleDeactivate(id: string) {
    const data = await deActivateSpecialization(id);
    if (data.success) {
      toast.success(data.message ?? "Specialization de-activated successfully");
      setUpdateList((prev) => prev + 1);
    } else {
      toast.error(
        data.message ?? "An error occured while de-activating specialization"
      );
    }
  }

  async function addSpecializationCallback(name: string, desc: string) {
    const data = await addSpecialization(name, desc);
    if (data.success) {
      toast.success(data.message ?? "Specialization added successfully");
      setShowAddSpecializationModal(false);
      setUpdateList((prev) => prev + 1);
    } else {
      toast.error(
        data.message ?? "An error occured while adding specialization"
      );
    }
  }

  async function editSpecializationCallback(name: string, desc: string) {
    const data = await editSpecialization(editData.id, name, desc);
    if (data.success) {
      toast.success(data.message ?? "Specialization updated successfully");
      setShowEditSpecializationModal(false);
      setUpdateList((prev) => prev + 1);
    } else {
      toast.error(
        data.message ?? "An error occured while updating specialization"
      );
    }
  }

  function handleEditModal(id: string, name: string, desc: string) {
    setEditData({ id, name, desc });
    setShowEditSpecializationModal(true);
  }

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
          <div className="flex flex-col gap-2 p-2 h-screen overflow-y-auto">
            <div className="flex-1 flex flex-col gap-3 bg-darkGreen rounded-xl  pt-2 pb-3 px-3">
              <div className="font-bold text-white">Specializations</div>
              <div className="flex flex-col lg:flex-row justify-between gap-2">
                <div className="flex flex-col lg:flex-row  gap-2">
                  <div className="flex gap-2 ">
                    <div className="flex  items-center rounded-md bg-white relative w-full">
                      <input
                        type="text"
                        className="p-2 bg-white rounded-md lg:w-80 active:border-none font-medium "
                        placeholder="Search specializations"
                        ref={searchRef}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {search && (
                        <button
                          className="mr-1 hover:scale-105 active:scale-95 transition-all duration-300 w-6 absolute right-0"
                          onClick={handleSearchClear}
                        >
                          {getIcon("close", "24px", "#bbbbbb")}
                        </button>
                      )}
                    </div>
                    <button
                      className="flex gap-2 font-medium p-2 bg-[#363636] rounded-md"
                      onClick={() => setUpdateList(updateList + 1)}
                    >
                      {getIcon("search", "25px", "#cccccc")}
                    </button>
                  </div>
                  <button className="flex gap-2 font-bold mr-1 py-2 px-4 bg-lightGreen rounded-md relative justify-center">
                    {getIcon("sort", "25px", "black")}
                    Sort by :
                    <select
                      name=""
                      id=""
                      className="font-semibold"
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="">None</option>
                      <option value="alpha-asc">aA-zZ</option>
                      <option value="alpha-desc">zZ-aA</option>
                    </select>
                  </button>
                </div>
                <button
                  className="flex gap-2 font-bold mr-1 py-2 px-4 bg-blue-300 rounded-md justify-center items-center"
                  onClick={() => setShowAddSpecializationModal(true)}
                >
                  Add new
                  {getIcon("add", "24px", "black")}
                </button>
              </div>
              <div className="flex-1 bg-white rounded-lg p-2 flex flex-col justify-between ">
                {data?.length ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {data.map((spec, index) => {
                      return (
                        <div
                          className={`${
                            spec.isActive ? "bg-lightGreen" : "bg-red-300"
                          } rounded-md flex flex-col px-4 py-3 `}
                          key={index}
                        >
                          <div className="flex justify-between">
                            <div className="flex items-center justify-center gap-2">
                              {/* <img src="" alt="icon" /> */}
                              <span className="font-bold">{spec.name}</span>
                            </div>
                            <div className="flex items-center justify-center">
                              <button
                                className="mr-1 p-1 h-full px-2 rounded-sm font-semibold text-[14px] hover:scale-105 active:scale-95 transition-all duration-300 hover:bg-gray-200"
                                onClick={() =>
                                  handleEditModal(
                                    spec.id,
                                    spec.name,
                                    spec.description
                                  )
                                }
                              >
                                Edit
                              </button>
                              {spec.isActive ? (
                                <button
                                  className="mr-1 py-0.5 px-2 h-full font-semibold text-[14px] rounded-sm hover:scale-105 active:scale-95 hover:bg-red-300 transition-all duration-300"
                                  onClick={() => handleDeactivate(spec.id)}
                                >
                                  De-activate
                                </button>
                              ) : (
                                <button
                                  className="mr-1 py-0.5 px-2 h-full font-semibold text-[14px] rounded-sm hover:scale-105 active:scale-95 hover:bg-lightGreen transition-all duration-300"
                                  onClick={() => handleActivate(spec.id)}
                                >
                                  Activate
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-[14px] font-medium text-[#5f5f5f]">
                            {spec.description}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className=" flex justify-center w-full h-full text-2xl items-center text-[#bbbbbb]">
                    No specializations
                  </div>
                )}

                {/* Pagination */}
                {data?.length && (
                  <PaginationBar
                    totalPageCount={totalPageCount}
                    setCurrentPage={setCurrentPage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ASpecializationManagement;
