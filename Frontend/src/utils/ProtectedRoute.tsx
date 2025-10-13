import { useSelector } from "react-redux";
import type { RootState } from "../state/store";
import { Outlet, Navigate } from "react-router";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const role = useSelector((state: RootState) => state.token.role);
  const allowed = allowedRoles.includes(role);
  return allowed ? <Outlet /> : <Navigate to={"/"} />;
}

export default ProtectedRoute;
