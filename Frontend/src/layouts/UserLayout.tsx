import { Outlet } from "react-router";
import UNavbar from "../components/user/UNavbar";

function UserLayout() {
  return (
    <>
      <UNavbar />
      <Outlet />
    </>
  );
}

export default UserLayout;
