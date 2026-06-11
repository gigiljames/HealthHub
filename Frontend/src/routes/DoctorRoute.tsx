import { Routes, Route } from "react-router";
import ProtectedRoute from "../utils/ProtectedRoute";
import { roles } from "../constants/roles";
import DLoginPage from "../pages/doctor/DLoginPage";
import DSignupPage from "../pages/doctor/DSignupPage";
import AuthForgotPasswordLayout from "../components/common/AuthForgotPasswordLayout";
import DHomePage from "../pages/doctor/DHomePage";
import LoginPageProtectedRoute from "../utils/LoginPageProtectedRoute";
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
import DoctorLayout from "../components/doctor/DoctorLayout";
import DAnalysis from "../pages/doctor/DAnalysis";
import DViewReportPage from "../pages/doctor/DViewReportPage";
import DViewPrescriptionPage from "../pages/doctor/DViewPrescriptionPage";
import DReviewsPage from "../pages/doctor/DReviewsPage";

function DoctorRoute() {
  return (
    <Routes>
      <Route path="" element={<DLandingPage />} />
      <Route path="onboarding" element={<DOnboarding />} />
      <Route element={<LoginPageProtectedRoute />}>
        <Route path="login" element={<DLoginPage />} />
        <Route path="signup" element={<DSignupPage />} />
        <Route
          path="forgot-password"
          element={<AuthForgotPasswordLayout role="doctor" />}
        />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={[roles.DOCTOR]} />}>
        <Route element={<DoctorLayout />}>
          <Route path="home" element={<DHomePage />} />
          <Route path="profile" element={<DProfilePage />} />
          <Route path="slots" element={<DSlotsPage />} />
          <Route path="appointments" element={<DAppointmentsPage />} />
          <Route path="appointments/:id" element={<DViewAppointmentPage />} />
          <Route path="reports/:id" element={<DViewReportPage />} />
          <Route path="prescriptions/:id" element={<DViewPrescriptionPage />} />
          <Route path="wallet" element={<DWalletPage />} />
          <Route path="payouts" element={<DPayoutsPage />} />
          <Route path="payouts/:id" element={<DViewPayoutPage />} />
          <Route path="practice-settings" element={<DPracticeSettingsPage />} />
          <Route path="analysis" element={<DAnalysis />} />
          <Route path="reviews" element={<DReviewsPage />} />
        </Route>
      </Route>
      <Route
        path="consultation/:appointmentId"
        element={<DConsultationRoomPage />}
      />
      {/* <Route
        path="consultation"
        element={<DConsultationRoomPage />}
      /> */}
    </Routes>
  );
}

export default DoctorRoute;
