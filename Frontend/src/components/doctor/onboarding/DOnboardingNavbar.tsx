import getIcon from "../../../helpers/getIcon";
import { logout } from "../../../api/auth/authService";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { persistor } from "../../../state/store";
import { useNavigate } from "react-router";

function DOnboardingNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      const data = await logout();
      if (data.success) {
        toast.success(data?.message || "Logged out successfully.");
      } else {
        toast.error(data?.message || "An error occurred while logging out");
      }
      dispatch({ type: "auth/logout" });
      persistor.purge();
      navigate("/doctor/auth");
    } catch (error) {
      console.log(error);
      toast.error((error as Error).message);
    }
  }
  return (
    <>
      <div className="fixed w-full z-1 top-0 h-[70px] bg-transparent bg-lightGreen flex items-center px-5 lg:px-20 justify-between border-b-1 border-b-gray-200 bg-white">
        <img src="/Logo_with_text_black.png" className="h-[50px]" />
        <div className="flex gap-6 text-gray-600 relative">
          <button
            className="bg-gray-100 px-3 py-2 rounded-md border-1 border-gray-300 flex items-center gap-2 cursor-pointer font-semibold hover:bg-gray-200 transition-colors duration-200 active:bg-gray-300 text-sm"
            onClick={handleLogout}
          >
            {getIcon("logout", "18px")}
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default DOnboardingNavbar;
