import { Routes, Route } from "react-router";
import HospitalAuthPage from "../pages/hospital/HospitalAuthPage";
import HospitalProfileCreationLayout from "../pages/hospital/HospitalProfileCreationLayout";
import AuthForgotPasswordLayout from "../components/common/AuthForgotPasswordLayout";
import HospitalHomePage from "../pages/hospital/HospitalHomePage";

function HospitalRoute() {
  return (
    <Routes>
      <Route path="" element={<div>Hospital Landing Page</div>} />
      <Route path="home" element={<HospitalHomePage />} />
      <Route path="auth" element={<HospitalAuthPage />} />
      <Route
        path="profile-creation"
        element={<HospitalProfileCreationLayout />}
      />
      <Route
        path="forgot-password"
        element={<AuthForgotPasswordLayout role="hospital" />}
      />
    </Routes>
  );
}

export default HospitalRoute;
