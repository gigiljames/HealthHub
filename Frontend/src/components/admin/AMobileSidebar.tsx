import { Link } from "react-router";
import getIcon from "../../helpers/getIcon";
import { useAdminStore } from "../../zustand/adminStore";
import { useEffect } from "react";
import { logout } from "../../api/auth/authService";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { removeToken } from "../../state/auth/tokenSlice";

function AMobileSidebar({ page }: { page: string }) {
  const isClosed = useAdminStore((state) => state.sidebarIsClosed);
  const setIsClosed = useAdminStore((state) => state.toggle);
  const adminSidebarItemStyles = ` cursor-pointer  py-2.5 rounded-md flex items-center text-[14px] px-5 gap-4`;
  const mobileSidebar = document.getElementById("mobileSidebar");
  const dispatch = useDispatch();

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
      console.log(error);
      toast.error(
        (error as Error)?.message || "An error occured while logging out."
      );
    }
  }

  useEffect(() => {
    if (isClosed) {
      if (mobileSidebar) mobileSidebar.style.left = "-100%";
    } else {
      if (mobileSidebar) mobileSidebar.style.left = "0";
    }
  }, [isClosed, mobileSidebar]);

  return (
    <>
      <div className="sticky top-0 z-100 lg:hidden">
        <div className=" relative">
          <div
            className={` w-full  justify-center items-center p-3 bg-[#363636] flex transition-all duration-200 font-medium  `}
          >
            <div className="flex justify-center items-center relative w-full">
              <Link to="/admin/home">
                <img src="/Logo_with_text.png" className="h-10" />
              </Link>
              <button
                className="absolute left-0 flex items-center"
                onClick={() => setIsClosed()}
              >
                {getIcon("burger-menu", "36px", "white")}
              </button>
            </div>
          </div>
          <div
            className=" h-screen w-screen absolute z-100 left-[-100%] top-0 transition-all duration-300 bg-[#363636] overflow-y-auto pb-4 font-medium"
            id="mobileSidebar"
          >
            <div
              className={` w-full lg:hidden justify-center items-center p-3 bg-[#363636] flex transition-all duration-200 font-medium`}
            >
              <div className="flex justify-center items-center relative w-full">
                <Link to="/admin/home">
                  <img src="/Logo_with_text.png" className="h-10" />
                </Link>
                <button
                  className="absolute right-0 flex items-center"
                  onClick={() => setIsClosed()}
                >
                  {getIcon("close", "36px", "white")}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar px-4">
              <div>
                <p
                  className={`uppercase font-bold text-[14px] mb-1 text-white`}
                >
                  Management
                </p>
                <ul className="flex flex-col gap-2 ">
                  <li
                    className={`${adminSidebarItemStyles} ${
                      page === "user-management"
                        ? "bg-lightGreen"
                        : "bg-white hover:bg-gray-400"
                    }`}
                  >
                    <span className="flex justify-center items-center">
                      {getIcon("user-management", "25px", "black")}
                    </span>
                    <span
                      className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300  text-[14px]/[18px] `}
                    >
                      User Management
                    </span>
                  </li>
                  <li
                    className={`${adminSidebarItemStyles} ${
                      page === "doctor-management"
                        ? "bg-lightGreen"
                        : "bg-white hover:bg-gray-400"
                    }`}
                  >
                    <span>{getIcon("doctor-management", "25px", "black")}</span>
                    <span
                      className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300  text-[14px]/[18px] `}
                    >
                      Doctor Management
                    </span>
                  </li>
                  <li
                    className={`${adminSidebarItemStyles} ${
                      page === "hospital-management"
                        ? "bg-lightGreen"
                        : "bg-white hover:bg-gray-400"
                    }`}
                  >
                    <span>
                      {getIcon("hospital-management", "25px", "black")}
                    </span>
                    <span
                      className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 text-[14px]/[18px] `}
                    >
                      Hospital Management
                    </span>
                  </li>
                  <li
                    className={`${adminSidebarItemStyles} ${
                      page === "appointment-management"
                        ? "bg-lightGreen"
                        : "bg-white hover:bg-gray-400"
                    }`}
                  >
                    <span>
                      {getIcon("appointment-management", "25px", "black")}
                    </span>
                    <span
                      className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 ${
                        isClosed
                          ? "opacity-0 w-0  overflow-hidden"
                          : "opacity-100"
                      } text-[14px]/[18px] `}
                    >
                      Appointment Management
                    </span>
                  </li>
                  <Link to="/admin/specialization-management">
                    <li
                      className={`${adminSidebarItemStyles} ${
                        page === "specialization-management"
                          ? "bg-lightGreen"
                          : "bg-white hover:bg-gray-400"
                      }`}
                    >
                      <span>
                        {getIcon("specialization-management", "25px", "black")}
                      </span>
                      <span
                        className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 ${
                          isClosed
                            ? "opacity-0 w-0  overflow-hidden"
                            : "opacity-100"
                        } text-[14px]/[18px] `}
                      >
                        Specialization Management
                      </span>
                    </li>
                  </Link>
                </ul>
              </div>
              <div>
                <p
                  className={`uppercase font-bold text-[14px] mb-1 text-white`}
                >
                  Verifications
                </p>
                <ul className="flex flex-col gap-2 ">
                  <li
                    className={`${adminSidebarItemStyles} ${
                      page === "doctor-verification"
                        ? "bg-lightGreen"
                        : "bg-white hover:bg-gray-400"
                    }`}
                  >
                    <span className="flex justify-center items-center">
                      {getIcon("verification", "25px", "black")}
                    </span>
                    <span
                      className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 ${
                        isClosed
                          ? "opacity-0 w-0 overflow-hidden"
                          : "opacity-100"
                      } text-[14px]/[18px] `}
                    >
                      Doctor Verification
                    </span>
                  </li>
                  <li
                    className={`${adminSidebarItemStyles} ${
                      page === "hospital-verification"
                        ? "bg-lightGreen"
                        : "bg-white hover:bg-gray-400"
                    }`}
                  >
                    <span>{getIcon("verification", "25px", "black")}</span>
                    <span
                      className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 ${
                        isClosed
                          ? "opacity-0 w-0  overflow-hidden"
                          : "opacity-100"
                      } text-[14px]/[18px] `}
                    >
                      Hospital Verification
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <p
                  className={`uppercase font-bold text-[14px] mb-1 text-white`}
                >
                  Reports
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
                        isClosed
                          ? "opacity-0 w-0 overflow-hidden"
                          : "opacity-100"
                      } text-[14px]/[18px]`}
                    >
                      Generate Report
                    </span>
                  </li>
                </ul>
                <div
                  className={`flex ${isClosed ? "flex-col" : ""} gap-2 mt-5`}
                >
                  <div
                    className="bg-red-400 w-full py-2 flex justify-center items-center rounded-md hover:bg-red-500 transition-all duration-200"
                    onClick={handleLogout}
                  >
                    {getIcon("on-off", "25px", "white")}
                  </div>
                  <div className="bg-gray-400 w-full py-2 flex justify-center items-center rounded-md hover:bg-gray-500 transition-all duration-200">
                    {getIcon("profile", "25px", "white")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AMobileSidebar;
