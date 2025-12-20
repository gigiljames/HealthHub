import { Routes, Route } from "react-router";
import DoctorAuthPage from "../pages/doctor/DoctorAuthPage";
import DProfileCreationLayout from "../pages/doctor/DProfileCreationLayout";
import AuthForgotPasswordLayout from "../components/common/AuthForgotPasswordLayout";
import ProtectedRoute from "../utils/ProtectedRoute";
import { roles } from "../constants/roles";
import DHomePage from "../pages/doctor/DHomePage";
import LoginPageProtectedRoute from "../utils/LoginPageProtectedRoute";
import ProfileCreationProtectedRoute from "../utils/ProfileCreationProtectedRoute";
import DLandingPage from "../pages/doctor/DLandingPage";

function DoctorRoute() {
  return (
    <Routes>
      <Route path="" element={<DLandingPage />} />
      <Route element={<LoginPageProtectedRoute />}>
        <Route path="auth" element={<DoctorAuthPage />} />
        <Route
          path="forgot-password"
          element={<AuthForgotPasswordLayout role="doctor" />}
        />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[roles.DOCTOR]} />}>
        <Route path="home" element={<DHomePage />} />
        <Route element={<ProfileCreationProtectedRoute />}>
          <Route path="profile-creation" element={<DProfileCreationLayout />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default DoctorRoute;
