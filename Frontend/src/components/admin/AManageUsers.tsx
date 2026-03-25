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
import ConfirmationModal from "../common/ConfirmationModal";
import AdminTable, { type ColumnDef } from "./AdminTable";

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
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string;
    action: "block" | "unblock";
    userName: string;
  }>({
    isOpen: false,
    userId: "",
    action: "block",
    userName: "",
  });

  function handleRowClick(userId: string) {
    setUserId(userId);
    toggleUserCard();
  }

  useEffect(() => {
    getUsers(searchRef.current?.value ?? "", currentPage, limit, sort)
      .then((data) => {
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
      setData((prev) =>
        prev
          ? prev.map((u) => (u.id === id ? { ...u, isBlocked: true } : u))
          : prev,
      );
    } else {
      toast.error(data.message ?? "An error occurred while blocking user");
    }
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }

  async function handleUnblockUser(id: string) {
    const data = await unblockUser(id);
    if (data.success) {
      toast.success(data.message ?? "User unblocked successfully");
      setData((prev) =>
        prev
          ? prev.map((u) => (u.id === id ? { ...u, isBlocked: false } : u))
          : prev,
      );
    } else {
      toast.error(data.message ?? "An error occurred while unblocking user");
    }
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }

  const columns: ColumnDef<UserData>[] = [
    {
      header: "Name",
      render: (user) => user.name,
    },
    {
      header: "Account Status",
      render: (user) => (
        <>
          <div>{user.isNewUser ? "New User" : "Profile completed"}</div>
          <div>{user.isBlocked ? "Blocked" : "Active"}</div>
        </>
      ),
    },
    {
      header: "Email",
      render: (user) => user.email,
    },
    {
      header: "",
      render: (user) =>
        user.isBlocked ? (
          <button
            className="px-3 py-1 border-1 rounded-md bg-green-100 text-green-500 border-green-500 hover:bg-green-200 active:bg-green-300 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmModal({
                isOpen: true,
                userId: user.id,
                action: "unblock",
                userName: user.name,
              });
            }}
          >
            Unblock
          </button>
        ) : (
          <button
            className="px-3 py-1 border-1 rounded-md bg-red-100 text-red-500 border-red-500 hover:bg-red-200 active:bg-red-300 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmModal({
                isOpen: true,
                userId: user.id,
                action: "block",
                userName: user.name,
              });
            }}
          >
            Block
          </button>
        ),
    },
  ];

  return (
    <>
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() =>
          confirmModal.action === "block"
            ? void handleBlockUser(confirmModal.userId)
            : void handleUnblockUser(confirmModal.userId)
        }
        title={confirmModal.action === "block" ? "Block User" : "Unblock User"}
        message={
          confirmModal.action === "block"
            ? `Are you sure you want to block ${confirmModal.userName}? They will not be able to log in.`
            : `Are you sure you want to unblock ${confirmModal.userName}? They will regain access to their account.`
        }
        confirmText={confirmModal.action === "block" ? "Block" : "Unblock"}
        isDestructive={confirmModal.action === "block"}
      />
      <div className="bg-white h-full rounded-lg flex flex-col gap-1.5 border-1 border-gray-300">
        {/* Header with Search & Sort */}
        <div className="rounded-t-lg text-black p-3 border-b-1 border-b-gray-300 bg-gray-100 flex lg:justify-between lg:items-center flex-col lg:flex-row gap-2">
          <div className="font-semibold">Users list</div>
          <div className="flex flex-col lg:flex-row justify-between gap-2">
            <div className="flex flex-col lg:flex-row gap-2">
              {/* Search */}
              <div className="flex gap-2">
                <div className="flex items-center rounded-md bg-white w-full border-1 border-gray-300 text-sm focus-within:ring-1 focus-within:ring-lightGreen">
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
                        className="hover:scale-105 active:scale-95 transition-all duration-300 w-6 absolute right-0"
                        onClick={handleSearchClear}
                      >
                        {getIcon("close", "20px", "#bbbbbb")}
                      </button>
                    )}
                  </div>
                  <button
                    className="flex gap-2 font-medium p-1"
                    onClick={() => setUpdateList(updateList + 1)}
                  >
                    <div className="hover:bg-gray-100 active:bg-gray-200 rounded-md p-1">
                      {getIcon("search", "25px", "#777777")}
                    </div>
                  </button>
                </div>
              </div>
              {/* Sort */}
              <button
                className="flex text-lightGreen gap-2 font-bold mr-1 px-2 py-2 bg-white rounded-md relative justify-center items-center border-1 border-lightGreen text-sm focus-within:ring-1"
                onClick={() => sortRef.current?.click()}
              >
                {getIcon("sort", "20px", "rgba(167, 215, 197)")}
                Sort by :
                <select
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

        {/* Table */}
        <div className="bg-white rounded-b-lg h-full flex flex-col justify-between overflow-x-auto px-1 lg:px-0">
          <AdminTable<UserData>
            columns={columns}
            data={data ?? []}
            keyExtractor={(user) => user.id}
            onRowClick={(user) => handleRowClick(user.id)}
            emptyMessage="No users found."
          />
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
