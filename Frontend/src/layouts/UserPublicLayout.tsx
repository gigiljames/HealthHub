import { Outlet } from "react-router";
import UGuestNavbar from "../components/user/UGuestNavbar";

function UserPublicLayout() {
  return (
    <>
      <UGuestNavbar />
      <Outlet />
    </>
  );
}

export default UserPublicLayout;
