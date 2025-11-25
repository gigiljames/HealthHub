import { useEffect, useRef, useState } from "react";
import PaginationBar from "../common/PaginationBar";
import getIcon from "../../helpers/getIcon";
import {
  getUsers,
  blockUser,
  unblockUser,
} from "../../api/admin/userManagementService";
import toast from "react-hot-toast";
import { useAdminStore } from "../../zustand/adminStore";

interface UserData {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  isNewUser: boolean;
}

function AManageUsers() {
  const [totalPageCount, setTotalPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [updateList, setUpdateList] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLSelectElement>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [limit] = useState(10);
  const [data, setData] = useState<UserData[] | null>(null);
  const setUserId = useAdminStore((state) => state.setUserId);
  const toggleUserCard = useAdminStore((state) => state.toggleUserCard);

  function handleRowClick(userId: string) {
    setUserId(userId);
    toggleUserCard();
  }

  useEffect(() => {
    getUsers(searchRef.current?.value ?? "", currentPage, limit, sort)
      .then((data) => {
        // console.log(data.users);
        if (data) {
          setData(data.users);
          const totalPageCount = Math.ceil(data.totalDocumentCount / limit);
          setTotalPageCount(totalPageCount);
        }
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

  async function handleBlockUser(id: string) {
    const data = await blockUser(id);
    if (data.success) {
      toast.success(data.message ?? "User blocked successfully");
      setUpdateList((prev) => prev + 1);
    } else {
      toast.error(data.message ?? "An error occurred while blocking user");
    }
  }

  async function handleUnblockUser(id: string) {
    const data = await unblockUser(id);
    if (data.success) {
      toast.success(data.message ?? "User unblocked successfully");
      setUpdateList((prev) => prev + 1);
    } else {
      toast.error(data.message ?? "An error occurred while unblocking user");
    }
  }
  return (
    <>
      <div className="bg-white h-full rounded-lg flex flex-col gap-1.5 border-1 border-gray-300">
        <div className="  rounded-t-lg text-black p-3 border-b-1 border-b-gray-300 bg-gray-100 flex lg:justify-between lg:items-center flex-col lg:flex-row gap-2">
          <div className="font-semibold">Users list</div>
          <div className="flex flex-col lg:flex-row justify-between gap-2">
            <div className="flex flex-col lg:flex-row  gap-2">
              <div className="flex gap-2 ">
                <div className="flex  items-center rounded-md bg-white w-full border-1 border-gray-300 text-sm focus-within:ring-1 focus-within:ring-lightGreen">
                  <div className="flex items-center relative w-full">
                    <input
                      type="text"
                      className="p-2 pr-8 bg-white rounded-md lg:w-80 active:border-none font-medium focus:outline-none w-full"
                      placeholder="Search users"
                      ref={searchRef}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        className=" hover:scale-105 active:scale-95 transition-all duration-300 w-6 absolute right-0"
                        onClick={handleSearchClear}
                      >
                        {getIcon("close", "20px", "#bbbbbb")}
                      </button>
                    )}
                  </div>
                  <button
                    className="flex gap-2 font-medium p-1  "
                    onClick={() => setUpdateList(updateList + 1)}
                  >
                    <div className="hover:bg-gray-100 active:bg-gray-200 rounded-md p-1">
                      {getIcon("search", "25px", "#777777")}
                    </div>
                  </button>
                </div>
              </div>
              <button
                className="flex text-lightGreen gap-2 font-bold mr-1 px-2 py-2 bg-white rounded-md relative justify-center items-center border-1 border-lightGreen text-sm focus-within:ring-1"
                onClick={() => sortRef.current?.click()}
              >
                {getIcon("sort", "20px", "rgba(167, 215, 197)")}
                Sort by :
                <select
                  name=""
                  id=""
                  className="font-semibol focus:outline-none"
                  onChange={(e) => setSort(e.target.value)}
                  ref={sortRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option className="text-black" value="">
                    None
                  </option>
                  <option className="text-black" value="alpha-asc">
                    aA-zZ
                  </option>
                  <option className="text-black" value="alpha-desc">
                    zZ-aA
                  </option>
                </select>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-lg h-full flex flex-col justify-between overflow-x-auto px-1 lg:px-0">
          <table className="management-table ">
            <thead>
              <tr className="border-b-1 border-b-gray-300">
                <th>Name</th>
                <th>Account Status</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.map((user) => {
                return (
                  <tr
                    className="hover:bg-slate-100 active:bg-slate-200 transition-all duration-200 text-sm border-b-1 border-b-gray-300"
                    onClick={() => {
                      handleRowClick(user.id);
                    }}
                  >
                    <td>{user.name}</td>
                    <td>
                      <div>
                        {user.isNewUser ? "New User" : "Profile completed"}
                      </div>
                      <div>{user.isBlocked ? "Blocked" : "Active"}</div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.isBlocked ? (
                        <button
                          className="px-3 py-1 border-1 rounded-md bg-green-100 text-green-500 border-green-500 hover:bg-green-200 active:bg-green-300 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleUnblockUser(user.id);
                          }}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          className="px-3 py-1 border-1 rounded-md bg-red-100 text-red-500 border-red-500 hover:bg-red-200 active:bg-red-300 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleBlockUser(user.id);
                          }}
                        >
                          Block
                        </button>
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
