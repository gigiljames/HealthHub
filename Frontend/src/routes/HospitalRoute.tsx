import { Routes, Route } from "react-router";
import HospitalAuthPage from "../pages/hospital/HospitalAuthPage";
import HospitalProfileCreationLayout from "../pages/hospital/HospitalProfileCreationLayout";
import AuthForgotPasswordLayout from "../components/common/AuthForgotPasswordLayout";
import HospitalHomePage from "../pages/hospital/HospitalHomePage";
import ProtectedRoute from "../utils/ProtectedRoute";
import { roles } from "../constants/roles";
import HDepartmentPage from "../pages/hospital/HDepartmentPage";
import LoginPageProtectedRoute from "../utils/LoginPageProtectedRoute";

function HospitalRoute() {
  return (
    <Routes>
      <Route path="" element={<div>Hospital Landing Page</div>} />
      <Route element={<LoginPageProtectedRoute />}>
        <Route path="auth" element={<HospitalAuthPage />} />
        <Route
          path="forgot-password"
          element={<AuthForgotPasswordLayout role="hospital" />}
        />
      </Route>
      <Route path="department" element={<HDepartmentPage />} />
      <Route element={<ProtectedRoute allowedRoles={[roles.HOSPITAL]} />}>
        <Route
          path="profile-creation"
          element={<HospitalProfileCreationLayout />}
        />
        <Route path="home" element={<HospitalHomePage />} />
      </Route>
    </Routes>
  );
}

export default HospitalRoute;
