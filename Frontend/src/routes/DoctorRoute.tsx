import { Routes, Route } from "react-router";
import DoctorAuthPage from "../pages/doctor/DoctorAuthPage";
import DProfileCreationLayout from "../pages/doctor/DProfileCreationLayout";
import AuthForgotPasswordLayout from "../components/common/AuthForgotPasswordLayout";
import ProtectedRoute from "../utils/ProtectedRoute";
import { roles } from "../constants/roles";
import DHomePage from "../pages/doctor/DHomePage";

function DoctorRoute() {
  return (
    <Routes>
      <Route path="" element={<div>Doctor Landing Page</div>} />
      <Route path="auth" element={<DoctorAuthPage />} />
      <Route
        path="forgot-password"
        element={<AuthForgotPasswordLayout role="doctor" />}
      />
      <Route element={<ProtectedRoute allowedRoles={[roles.DOCTOR]} />}>
        <Route path="home" element={<DHomePage />} />
      </Route>
      <Route path="profile-creation" element={<DProfileCreationLayout />} />
    </Routes>
  );
}

export default DoctorRoute;
