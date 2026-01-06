// import { useState } from "react";
import getIcon from "../../helpers/getIcon";
import { Link } from "react-router";
import { useAdminStore } from "../../zustand/adminStore";
import { logout } from "../../api/auth/authService";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { removeToken } from "../../state/auth/tokenSlice";

function HSidebar({ page }: { page: string }) {
  const isClosed = useAdminStore((state) => state.sidebarIsClosed);
  const setIsClosed = useAdminStore((state) => state.toggle);
  const dispatch = useDispatch();
  const adminSidebarItemStyles = ` cursor-pointer  py-3 rounded-md flex  items-center  text-[15px]  transition-all duration-100 ${
    isClosed ? "justify-center" : "px-5 gap-4"
  }`;
  async function handleLogout() {
    try {
      const data = await logout();
      if (data.success) {
        toast.success(data?.message || "Logged out successfully.");
        dispatch(removeToken());
      } else {
        toast.error(data?.message || "An error occured while logging out.");
      }
    } catch (error) {
      toast.error(
        (error as Error)?.message || "An error occured while logging out."
      );
    }
  }
  return (
    <>
      <div
        className={`h-screen hidden lg:flex ${
          isClosed ? "w-12 md:w-18 px-1.5 md:px-2.5 py-4" : "w-64 p-4"
        } bg-[#363636]  flex-col gap-3 transition-all duration-200 font-medium `}
      >
        <Link to="/hospital/home">
          <div className="flex justify-center items-center">
            {isClosed ? (
              <img src="/HealthHub_logo.png" className="h-10" />
            ) : (
              <img src="/Logo_with_text.png" className="h-10" />
            )}
          </div>
        </Link>
        <div
          className={`flex  ${isClosed ? " justify-center" : "justify-end"} `}
        >
          <div
            className={`bg-darkGreen w-full flex  justify-center items-center rounded-md ${
              isClosed && "w-full"
            } py-2 px-4`}
            onClick={() => setIsClosed()}
          >
            <span
              className={`${
                isClosed ? "rotate-0" : "rotate-180"
              } transition-rotate`}
            >
              {getIcon("open-sidebar", "20px", "white")}
            </span>
          </div>
        </div>
        <div className="flex flex-col overflow-y-auto no-scrollbar h-full justify-between">
          <div className="flex flex-col gap-3 font-semibold">
            <div>
              <p
                className={`uppercase font-bold  mb-2 ${
                  isClosed
                    ? "bg-gray-500 text-transparent rounded-md"
                    : "text-white"
                }`}
              >
                {isClosed ? "-" : "General"}
              </p>
              <ul className="flex flex-col gap-2 ">
                <Link to="/hospital/home">
                  <li
                    className={`${adminSidebarItemStyles} ${
                      page === "dashboard"
                        ? "bg-lightGreen"
                        : "bg-white hover:bg-gray-400"
                    }`}
                  >
                    <span className="flex justify-center items-center">
                      {getIcon("user-management", "25px", "black")}
                    </span>
                    <span
                      className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 ${
                        isClosed
                          ? "opacity-0 w-0 overflow-hidden"
                          : "opacity-100"
                      } text-[14px]/[18px] `}
                    >
                      Dashboard
                    </span>
                  </li>
                </Link>
                <li
                  className={`${adminSidebarItemStyles} ${
                    page === "analytics"
                      ? "bg-lightGreen"
                      : "bg-white hover:bg-gray-400"
                  }`}
                >
                  <span>{getIcon("doctor-management", "25px", "black")}</span>
                  <span
                    className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 ${
                      isClosed
                        ? "opacity-0 w-0  overflow-hidden"
                        : "opacity-100"
                    } text-[14px]/[18px] `}
                  >
                    Analytics
                  </span>
                </li>
                <li
                  className={`${adminSidebarItemStyles} ${
                    page === "wallet"
                      ? "bg-lightGreen"
                      : "bg-white hover:bg-gray-400"
                  }`}
                >
                  <span>{getIcon("hospital-management", "25px", "black")}</span>
                  <span
                    className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 ${
                      isClosed
                        ? "opacity-0 w-0  overflow-hidden"
                        : "opacity-100"
                    } text-[14px]/[18px] `}
                  >
                    Wallet & Transaction History
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <p
                className={`uppercase font-bold  mb-2 ${
                  isClosed
                    ? "bg-gray-500 text-transparent rounded-md"
                    : "text-white"
                }`}
              >
                {isClosed ? "-" : "Reports"}
              </p>
              <ul className="flex flex-col gap-2 ">
                <li
                  className={`${adminSidebarItemStyles} ${
                    page === "generate-report"
                      ? "bg-lightGreen"
                      : "bg-white hover:bg-gray-400"
                  }`}
                >
                  <span className="flex justify-center items-center">
                    {getIcon("generate-report", "25px", "black")}
                  </span>
                  <span
                    className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 ${
                      isClosed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    } text-[14px]/[18px]`}
                  >
                    Generate Report
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div
            className={`flex ${isClosed ? "flex-col-reverse" : ""} gap-2 mt-5`}
          >
            <div
              className="bg-red-400 w-full py-2 flex justify-center items-center rounded-md hover:bg-red-500 transition-all duration-200"
              onClick={handleLogout}
            >
              {getIcon("on-off", "25px", "white")}
            </div>
            <Link to="/hospital/profile" className="w-full">
              <div className="bg-gray-400 w-full py-2 flex justify-center items-center rounded-md hover:bg-gray-500 transition-all duration-200">
                {getIcon("profile", "25px", "white")}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default HSidebar;
