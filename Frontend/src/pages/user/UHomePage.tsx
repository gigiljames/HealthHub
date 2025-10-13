import { useDispatch } from "react-redux";
import { removeToken } from "../../state/auth/tokenSlice";
import { useNavigate } from "react-router";
import axios from "../../api/axios";
import { logout } from "../../api/auth/authService";
import toast from "react-hot-toast";

function UHomePage() {
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
      <div>User Home Page</div>
      <button onClick={handleLogout}>Logout</button>
      <button
        onClick={async () => {
          const response = await axios.get("/users");
          console.log(response);
        }}
      >
        Get
      </button>
    </>
  );
}

export default UHomePage;
