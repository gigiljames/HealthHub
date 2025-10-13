import React, { useEffect, useRef, useState } from "react";
import PaginationBar from "../common/PaginationBar";
import getIcon from "../../helpers/getIcon";

const userList = [
  {
    name: "Gigil James",
    email: "gigiljames02@gmail.com",
    phone: "9605619066",
    isVerified: true,
    isBlocked: false,
    lastLogin: new Date(),
  },
  {
    name: "Gigil James",
    email: "gigiljames02@gmail.com",
    phone: "9605619066",
    isVerified: false,
    isBlocked: true,
    lastLogin: new Date(),
  },
];

function AManageUsers() {
  const [totalPageCount, setTotalPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [updateList, setUpdateList] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [limit] = useState(9);

  useEffect(() => {
    // getSpecializations(
    //   searchRef.current?.value ?? "",
    //   currentPage,
    //   limit,
    //   sort
    // ).then((data) => {
    //   // console.log(data);
    //   setData(data.specializations);
    //   const totalPageCount = Math.ceil(data.totalDocumentCount / limit);
    //   setTotalPageCount(totalPageCount);
    // });
  }, [updateList, currentPage, limit, sort]);

  function handleSearchClear() {
    if (searchRef.current) searchRef.current.value = "";
    setSearch("");
    setUpdateList(updateList + 1);
  }
  return (
    <>
      <div className="bg-darkGreen h-full rounded-md p-2 flex flex-col gap-1.5">
        <div className="font-bold text-white">Users list</div>
        <div className="flex flex-col lg:flex-row justify-between gap-2">
          <div className="flex flex-col lg:flex-row  gap-2">
            <div className="flex gap-2 ">
              <div className="flex  items-center rounded-md bg-white relative w-full">
                <input
                  type="text"
                  className="p-2 bg-white rounded-md lg:w-80 active:border-none font-medium "
                  placeholder="Search users"
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
        </div>
        <div className="bg-white rounded-sm h-full flex flex-col justify-between">
          <table className="management-table ">
            <thead>
              <tr>
                <th>Name</th>
                <th>Account Status</th>
                <th>Email</th>
                <th>Phone number</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user) => {
                return (
                  <tr>
                    <td>{user.name}</td>
                    <td>
                      <div>{user.isVerified ? "Verified" : "Not verified"}</div>
                      <div>{user.isBlocked ? "Blocked" : "Active"}</div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      {user.isBlocked ? (
                        <button>Unblock</button>
                      ) : (
                        <button>Block</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <PaginationBar
            totalPageCount={totalPageCount}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
}

export default AManageUsers;
