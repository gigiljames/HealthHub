import { useEffect, useRef, useState } from "react";
import getIcon from "../../helpers/getIcon";
import HSidebar from "../../components/hospital/HSidebar";
import { data, useNavigate } from "react-router";
import HDepartmentModal from "../../components/hospital/HDepartmentModal";
import toast from "react-hot-toast";
import { getDepartments } from "../../api/hospital/departmentService";

interface IDepartments {
  name: string;
  color: string;
  id: string;
}

function HospitalHomePage() {
  document.title = "Hospital Dashboard";
  const [showAddDepartmentnModal, setShowAddDepartmentModal] = useState(false);
  const [departments, setDepartments] = useState<IDepartments[]>([]);
  const [updateList, setUpdateList] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [limit] = useState(9);
  const [totalPages, setTotalPages] = useState<number[]>([1]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    getDepartments(
      searchRef.current?.value ?? "",
      currentPage,
      limit,
      sort
    ).then((data) => {
      setDepartments(data.departments);
      const totalPageCount = Math.ceil(data.totalDocumentCount / limit);
      const pages = [];
      for (let i = 1; i <= totalPageCount; i++) pages.push(i);
      setTotalPages(pages);
    });
    setDepartments([
      { name: "Cardiology", id: "", color: "#a7d7c5" },
      { name: "Paediatrics", id: "", color: "#a7d7c5" },
      { name: "Cardiology", id: "", color: "#a7d7c5" },
      { name: "Paediatrics", id: "", color: "#a7d7c5" },
    ]);
  }, [updateList, currentPage, limit, sort]);

  function handleSearchClear() {
    if (searchRef.current) searchRef.current.value = "";
    setSearch("");
    setUpdateList(updateList + 1);
  }

  async function addDepartmentCallback(name: string, color: string) {
    //call add department service here
    setDepartments((prev) => [...prev, { name, id: "", color }]);
    toast.success("Department created successfully");
    setShowAddDepartmentModal(false);
    // setUpdateList((prev) => prev + 1);
  }

  function handleCardClick(id: string) {
    //set id state
    navigate("/hospital/department");
  }

  return (
    <>
      {showAddDepartmentnModal && (
        <HDepartmentModal
          type="add"
          callback={addDepartmentCallback}
          setShowDepartmentModal={setShowAddDepartmentModal}
        />
      )}
      <div className="flex w-full flex-col lg:flex-row ">
        <HSidebar page="dashboard" />
        <div className="w-screen lg:flex-1">
          <div className="flex flex-col gap-2 p-2 h-screen overflow-y-auto">
            <div className="bg-darkGreen rounded-xl p-3 pt-2 h-full flex flex-col gap-3">
              <p className="font-bold text-white ">Departments</p>
              <div className="flex flex-col lg:flex-row justify-between gap-2">
                <div className="flex flex-col lg:flex-row  gap-2">
                  <div className="flex gap-2 ">
                    <div className="flex  items-center rounded-md bg-white relative w-full">
                      <input
                        type="text"
                        className="p-2 bg-white rounded-md lg:w-80 active:border-none font-medium "
                        placeholder="Search departments"
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
                  className="flex gap-2 font-bold mr-1 py-2 px-4 bg-lightBlue rounded-md justify-center items-center"
                  onClick={() => setShowAddDepartmentModal(true)}
                >
                  Create new
                  {getIcon("add", "24px", "black")}
                </button>
              </div>
              {/* <div className="flex flex-col md:flex-row gap-3 mb-2.5">
                <input
                  type="text"
                  placeholder="Enter name of department"
                  className="border-1 border-inputBorder p-3 rounded-lg peer md:min-w-[200px] lg:min-w-[300px] bg-white h-[45px]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="flex gap-3">
                  <div className="flex justify-between border-1 border-inputBorder p-2 rounded-lg peer md:min-w-[200px] lg:min-w-[300px] bg-white h-[45px]">
                    <label
                      htmlFor="icon-input"
                      className="bg-gray-200 text-[#999999] flex px-3 items-center rounded-sm text-sm font-medium hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Click to choose icon
                    </label>
                    <input
                      type="file"
                      id="icon-input"
                      className="max-w-[200px] hidden"
                    />
                    <span className="h-full w-7 bg-inputBorder rounded-sm text-center">
                      i
                    </span>
                  </div>
                  <button
                    className="rounded-lg px-6 bg-lightBlue flex justify-center items-center gap-2 hover:-translate-y-0.5 transition-all duration-200"
                    onClick={handleAddDepartment}
                  >
                    <span className="font-bold ">Add</span>
                    <span>{getIcon("add", "24px", "black")}</span>
                  </button>
                </div>
              </div> */}
              <div className="flex-1 bg-white rounded-lg">
                <div className=" e rounded-lg p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-2">
                  {departments.map((dept) => (
                    <div
                      style={{ backgroundColor: dept.color }}
                      className={`flex justify-between  p-5 rounded-md w-full items-center hover:scale-101 active:scale-95 transition-all duration-200 `}
                      onClick={() => handleCardClick(dept.id)}
                    >
                      <p className="font-bold w-full">{dept.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HospitalHomePage;
