import { useSelector } from "react-redux";
import type { RootState } from "../state/store";
import { Outlet, Navigate, useLocation } from "react-router";
import { roles } from "../constants/roles";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const role = useSelector((state: RootState) => state.token.role);
  const token = useSelector((state: RootState) => state.token.token);
  const location = useLocation();

  const allowed = allowedRoles.includes(role);

  if (allowed) {
    return <Outlet />;
  }

  // If logged in but not allowed, redirect to their respective home page
  if (token) {
    switch (role) {
      case roles.ADMIN:
        return <Navigate to="/admin/home" replace />;
      case roles.DOCTOR:
        return <Navigate to="/doctor/home" replace />;
      case roles.USER:
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If not logged in, redirect to the appropriate login page based on URL prefix
  if (location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin" replace />;
  }
  if (location.pathname.startsWith("/doctor")) {
    return <Navigate to="/doctor/login" replace />;
  }
  return <Navigate to="/login" replace />;
}

export default ProtectedRoute;

