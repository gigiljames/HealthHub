import { Routes, Route } from "react-router";
import DoctorAuthPage from "../pages/doctor/DoctorAuthPage";
import AuthForgotPasswordLayout from "../components/common/AuthForgotPasswordLayout";
import ProtectedRoute from "../utils/ProtectedRoute";
import { roles } from "../constants/roles";
import DHomePage from "../pages/doctor/DHomePage";
import LoginPageProtectedRoute from "../utils/LoginPageProtectedRoute";
// import ProfileCreationProtectedRoute from "../utils/ProfileCreationProtectedRoute";
import DLandingPage from "../pages/doctor/DLandingPage";
import DProfilePage from "../pages/doctor/DProfilePage";
import DSlotsPage from "../pages/doctor/DSlotsPage";
import DAppointmentsPage from "../pages/doctor/DAppointmentsPage";
import DViewAppointmentPage from "../pages/doctor/DViewAppointmentPage";
import DPracticeSettingsPage from "../pages/doctor/DPracticeSettingsPage";
import DOnboarding from "../pages/doctor/DOnboarding";
import DWalletPage from "../pages/doctor/DWalletPage";
import DConsultationRoomPage from "../pages/doctor/DConsultationRoomPage";
import DPayoutsPage from "../pages/doctor/DPayoutsPage";
import DViewPayoutPage from "../pages/doctor/DViewPayoutPage";

function DoctorRoute() {
  return (
    <Routes>
      <Route path="" element={<DLandingPage />} />
      <Route path="onboarding" element={<DOnboarding />} />
      <Route element={<LoginPageProtectedRoute />}>
        <Route path="auth" element={<DoctorAuthPage />} />
        <Route
          path="forgot-password"
          element={<AuthForgotPasswordLayout role="doctor" />}
        />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[roles.DOCTOR]} />}>
        <Route path="home" element={<DHomePage />} />
        {/* <Route element={<ProfileCreationProtectedRoute />}>
          <Route path="profile-creation" element={<DProfileCreationLayout />} />
        </Route> */}
        <Route path="profile" element={<DProfilePage />} />
        <Route path="slots" element={<DSlotsPage />} />
        <Route path="appointments" element={<DAppointmentsPage />} />
        <Route path="appointments/:id" element={<DViewAppointmentPage />} />
        <Route
          path="consultation/:appointmentId"
          element={<DConsultationRoomPage />}
        />
        <Route path="wallet" element={<DWalletPage />} />
        <Route path="payouts" element={<DPayoutsPage />} />
        <Route path="payouts/:id" element={<DViewPayoutPage />} />
        <Route path="practice-settings" element={<DPracticeSettingsPage />} />
      </Route>
    </Routes>
  );
}

export default DoctorRoute;
