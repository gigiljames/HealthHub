import { removeToken } from "../../state/auth/tokenSlice";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { logout } from "../../api/auth/authService";

function DHomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  async function handleLogout() {
    try {
      const data = await logout();
      if (data.success) {
        toast.success(data?.message || "Logged out successfully.");
      } else {
        toast.error(data?.message || "An error occured while logging out");
      }
      dispatch(removeToken());
      navigate("/auth");
    } catch (error) {
      console.log(error);
      toast.error((error as Error).message);
    }
  }

  document.title = "HealthHub Home";
  return (
    <>
      <div>Doctor Home Page</div>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}

export default DHomePage;
