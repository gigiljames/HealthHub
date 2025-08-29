import { Routes, Route } from "react-router";
import DoctorAuthPage from "../pages/doctor/DoctorAuthPage";
import DProfileCreationLayout from "../pages/doctor/DProfileCreationLayout";
import AuthForgotPasswordLayout from "../components/common/AuthForgotPasswordLayout";

function DoctorRoute() {
  return (
    <Routes>
      <Route path="" element={<div>Doctor Landing Page</div>} />
      <Route path="auth" element={<DoctorAuthPage />} />
      <Route path="profile-creation" element={<DProfileCreationLayout />} />
      <Route
        path="forgot-password"
        element={<AuthForgotPasswordLayout role="doctor" />}
      />
    </Routes>
  );
}

export default DoctorRoute;
