import { useSelector } from "react-redux";
import type { RootState } from "../state/store";
import { roles } from "../constants/roles";
import UserLayout from "../layouts/UserLayout";
import type { JSX } from "react";

interface RoleBasedLayoutProps {
  publicLayout: JSX.Element;
}

function RoleBasedLayout({ publicLayout }: RoleBasedLayoutProps) {
  const role = useSelector((state: RootState) => state.token.role);
  switch (role) {
    case roles.USER:
      return <UserLayout />;
    case roles.DOCTOR:
      return;
    default:
      return publicLayout;
  }
}

export default RoleBasedLayout;
