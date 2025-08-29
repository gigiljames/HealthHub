// import React from "react";
import { Routes, Route } from "react-router";
import UserAuthPage from "../pages/user/UserAuthPage";
import UProfileCreationLayout from "../pages/user/UProfileCreationLayout";
import UHomePage from "../pages/user/UHomePage";
import AuthForgotPasswordLayout from "../components/common/AuthForgotPasswordLayout";
import ULandingPage from "../pages/user/ULandingPage";

function UserRoute() {
  return (
    <Routes>
      <Route path="" element={<ULandingPage />} />
      <Route path="auth" element={<UserAuthPage />} />
      <Route path="profile-creation" element={<UProfileCreationLayout />} />
      <Route path="home" element={<UHomePage />} />
      <Route
        path="forgot-password"
        element={<AuthForgotPasswordLayout role="" />}
      />
    </Routes>
  );
}

export default UserRoute;
