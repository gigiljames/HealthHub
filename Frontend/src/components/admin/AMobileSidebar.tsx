import { Link } from "react-router";
import getIcon from "../../helpers/getIcon";
import { useAdminStore } from "../../zustand/adminStore";
import { useEffect } from "react";
import { logout } from "../../api/auth/authService";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { persistor } from "../../state/store";

function AMobileSidebar({ page }: { page: string }) {
  const isClosed = useAdminStore((state) => state.sidebarIsClosed);
  const setIsClosed = useAdminStore((state) => state.toggle);
  const setSidebarClosed = useAdminStore((state) => state.setSidebarClosed);
  const adminSidebarItemStyles = ` cursor-pointer  py-2.5 rounded-md flex items-center text-[14px] px-5 gap-4`;
  const mobileSidebar = document.getElementById("mobileSidebar");
  const dispatch = useDispatch();

  async function handleLogout() {
    try {
      const data = await logout();
      if (data.success) {
        toast.success(data?.message || "Logged out successfully.");
        dispatch({ type: "auth/logout" });
        persistor.purge();
      } else {
        toast.error(data?.message || "An error occured while logging out.");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        (error as Error)?.message || "An error occured while logging out.",
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
                <ul className="flex flex-col gap-2 " onClick={() => setSidebarClosed(true)}>
                  <Link to={"/admin/home"}>
                    <li
                      className={`${adminSidebarItemStyles} ${
                        page === "dashboard"
                          ? "bg-lightGreen"
                          : "bg-white hover:bg-gray-400"
                      }`}
                    >
                      <span className="flex justify-center items-center">
                        {getIcon("dashboard", "25px", "black")}
                      </span>
                      <span
                        className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300  text-[14px]/[18px] `}
                      >
                        Dashboard
                      </span>
                    </li>
                  </Link>
                  <Link to={"/admin/user-management"}>
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
                  </Link>
                  <Link to={"/admin/doctor-management"}>
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
                  </Link>
                  <Link to="/admin/hospital-management">
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
                        Organization Management
                      </span>
                    </li>
                  </Link>
                  <Link to="/admin/appointments">
                    <li
                      className={`${adminSidebarItemStyles} ${
                        page === "appointments"
                          ? "bg-lightGreen"
                          : "bg-white hover:bg-gray-400"
                      }`}
                    >
                      <span>
                        {getIcon("appointment-management", "25px", "black")}
                      </span>
                      <span
                        className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 text-[14px]/[18px] `}
                      >
                        Appointment Management
                      </span>
                    </li>
                  </Link>
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
                        className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 text-[14px]/[18px] `}
                      >
                        Specialization Management
                      </span>
                    </li>
                  </Link>
                  <Link to="/admin/reviews">
                    <li
                      className={`${adminSidebarItemStyles} ${
                        page === "reviews"
                          ? "bg-lightGreen"
                          : "bg-white hover:bg-gray-400"
                      }`}
                    >
                      <span>
                        {getIcon("star", "25px", "black")}
                      </span>
                      <span
                        className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 text-[14px]/[18px] `}
                      >
                        Reviews Management
                      </span>
                    </li>
                  </Link>
                  <Link to="/admin/disputes">
                    <li
                      className={`${adminSidebarItemStyles} ${
                        page === "disputes"
                          ? "bg-lightGreen"
                          : "bg-white hover:bg-gray-400"
                      }`}
                    >
                      <span>
                        {getIcon("exclamation-circle", "25px", "black")}
                      </span>
                      <span
                        className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 text-[14px]/[18px] `}
                      >
                        Disputes Management
                      </span>
                    </li>
                  </Link>
                  <Link to="/admin/wallets">
                    <li
                      className={`${adminSidebarItemStyles} ${
                        page === "wallets"
                          ? "bg-lightGreen"
                          : "bg-white hover:bg-gray-400"
                      }`}
                    >
                      <span>{getIcon("wallet", "25px", "black")}</span>
                      <span
                        className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 text-[14px]/[18px] `}
                      >
                        Wallet Management
                      </span>
                    </li>
                  </Link>
                  <Link to="/admin/transactions">
                    <li
                      className={`${adminSidebarItemStyles} ${
                        page === "transactions"
                          ? "bg-lightGreen"
                          : "bg-white hover:bg-gray-400"
                      }`}
                    >
                      <span>{getIcon("transaction", "25px", "black")}</span>
                      <span
                        className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 text-[14px]/[18px] `}
                      >
                        Transaction Management
                      </span>
                    </li>
                  </Link>
                  <Link to="/admin/payouts">
                    <li
                      className={`${adminSidebarItemStyles} ${
                        page === "payouts"
                          ? "bg-lightGreen"
                          : "bg-white hover:bg-gray-400"
                      }`}
                    >
                      <span>{getIcon("payout", "25px", "black")}</span>
                      <span
                        className={`flex justify-center items-center h-7 transition-opacity delay-200  duration-300 text-[14px]/[18px] `}
                      >
                        Payout Management
                      </span>
                    </li>
                  </Link>
                </ul>
              </div>
              <div className="mt-2">
                <div className="flex gap-2">
                  <div
                    className="bg-red-400/95 w-full py-2 flex justify-center items-center font-bold text-white gap-2 rounded-md hover:bg-red-500 transition-all duration-200 cursor-pointer"
                    onClick={handleLogout}
                  >
                    {getIcon("on-off", "25px", "white")}
                    <span>Logout</span>
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
