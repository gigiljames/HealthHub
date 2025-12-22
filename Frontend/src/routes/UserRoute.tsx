// import React from "react";
import { Routes, Route } from "react-router";
import UserAuthPage from "../pages/user/UserAuthPage";
import UProfileCreationLayout from "../pages/user/UProfileCreationLayout";
import UHomePage from "../pages/user/UHomePage";
import AuthForgotPasswordLayout from "../components/common/AuthForgotPasswordLayout";
import ULandingPage from "../pages/user/ULandingPage";
import ProtectedRoute from "../utils/ProtectedRoute";
import { roles } from "../constants/roles";
import LoginPageProtectedRoute from "../utils/LoginPageProtectedRoute";
import ProfileCreationProtectedRoute from "../utils/ProfileCreationProtectedRoute";
import UProfilePage from "../pages/user/UProfilePage";

function UserRoute() {
  return (
    <Routes>
      <Route path="/" element={<ULandingPage />} />
      <Route element={<ProtectedRoute allowedRoles={[roles.USER]} />}>
        <Route path="/home" element={<UHomePage />} />
        <Route element={<ProfileCreationProtectedRoute />}>
          <Route
            path="/profile-creation"
            element={<UProfileCreationLayout />}
          />
        </Route>
      </Route>
      <Route element={<LoginPageProtectedRoute />}>
        <Route path="/auth" element={<UserAuthPage />} />

        <Route
          path="/forgot-password"
          element={<AuthForgotPasswordLayout role="user" />}
        />
      </Route>
      <Route path="/profile" element={<UProfilePage />} />
    </Routes>
  );
}

export default UserRoute;
