import { useSelector } from "react-redux";
import type { RootState } from "../state/store";
import { roles } from "../constants/roles";
import { Navigate, Outlet } from "react-router";
import { URL } from "../constants/URLs";

function ProfileCreationProtectedRoute() {
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const role = userInfo.role;
  if (!userInfo.isNewUser) {
    switch (role) {
      case roles.ADMIN:
        return <Navigate to={URL.admin.HOME} />;
      case roles.DOCTOR:
        return <Navigate to={URL.doctor.HOME} />;
      case roles.HOSPITAL:
        return <Navigate to={URL.hospital.HOME} />;
      case roles.USER:
        return <Navigate to={URL.user.HOME} />;
      default:
        break;
    }
  } else {
    return <Outlet />;
  }
}

export default ProfileCreationProtectedRoute;
