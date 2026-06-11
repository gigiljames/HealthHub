// import React from "react";
import { Routes, Route } from "react-router";
import ULoginPage from "../pages/user/ULoginPage";
import USignupPage from "../pages/user/USignupPage";
import UProfileCreationLayout from "../pages/user/UProfileCreationLayout";
// import UHomePage from "../pages/user/UHomePage";
import AuthForgotPasswordLayout from "../components/common/AuthForgotPasswordLayout";
import ULandingPage from "../pages/user/ULandingPage";
import ProtectedRoute from "../utils/ProtectedRoute";
import { roles } from "../constants/roles";
import LoginPageProtectedRoute from "../utils/LoginPageProtectedRoute";
import ProfileCreationProtectedRoute from "../utils/ProfileCreationProtectedRoute";
import UProfilePage from "../pages/user/UProfilePage";
import Calendar from "../components/calendar/Calendar";
import UDoctorsPage from "../pages/user/UDoctorsPage";
import UViewDoctorPage from "../pages/user/UViewDoctorPage";
import UAppointmentBookingPage from "../pages/user/UAppointmentBookingPage";
import UAppointmentsListingPage from "../pages/user/UAppointmentsListingPage";
import UViewAppointmentPage from "../pages/user/UViewAppointmentPage";
import UAppointmentConfirmationPage from "../pages/user/UAppointmentConfirmationPage";
import UWalletConfirmationPage from "../pages/user/UWalletConfirmationPage";
import UViewDoctorSlotsPage from "../pages/user/UViewDoctorSlotsPage";
import UWalletPage from "../pages/user/UWalletPage";
import UConsultationRoomPage from "../pages/patient/UConsultationRoomPage";
import RoleBasedLayout from "../utils/RoleBasedLayout";
import UserPublicLayout from "../layouts/UserPublicLayout";
import USettingsPage from "../pages/user/USettingsPage";
import UViewReportPage from "../pages/user/UViewReportPage";
import UViewPrescriptionPage from "../pages/user/UViewPrescriptionPage";
import UMedicalRecordsPage from "../pages/user/UMedicalRecordsPage";
import UOrganizationEnrolPage from "../pages/user/UOrganizationEnrolPage";
import UOrganizationStatusPage from "../pages/user/UOrganizationStatusPage";

function UserRoute() {
  return (
    <Routes>
      <Route element={<UserPublicLayout />}>
        <Route path="/organizations/enrol" element={<UOrganizationEnrolPage />} />
        <Route path="/organizations/status" element={<UOrganizationStatusPage />} />
      </Route>
      <Route element={<RoleBasedLayout publicLayout={<UserPublicLayout />} />}>
        <Route path="/" element={<ULandingPage />} />
        <Route path="/doctors" element={<UDoctorsPage />} />
        <Route path="/doctors/:doctorId" element={<UViewDoctorPage />} />
        <Route
          path="/doctors/:doctorId/slots"
          element={<UViewDoctorSlotsPage />}
        />
        <Route
          path="/calendar"
          element={
            <div className="h-screen w-screen flex items-center justify-center">
              <Calendar
                // height="560px"
                events={[
                  {
                    start: new Date("2026-01-12T09:00:00").toISOString(),
                    end: new Date("2026-01-12T09:30:00").toISOString(),
                    title: "Morning Consultation",
                  },
                  {
                    start: new Date("2026-01-12T09:30:00").toISOString(),
                    end: new Date("2026-01-12T10:00:00").toISOString(),
                    title: "Follow-up Visit",
                  },
                  {
                    start: new Date("2026-01-12T10:00:00").toISOString(),
                    end: new Date("2026-01-12T10:15:00").toISOString(),
                    title: "Emergency Buffer",
                  },
                  {
                    start: new Date("2026-01-12T10:15:00").toISOString(),
                    end: new Date("2026-01-12T10:45:00").toISOString(),
                    title: "General Checkup",
                  },
                  {
                    start: new Date("2026-01-12T16:00:00").toISOString(),
                    end: new Date("2026-01-12T18:30:00").toISOString(),
                    title: "Procedure Slot",
                  },

                  // ───────── Tuesday (Jan 13) ─────────
                  {
                    start: new Date("2026-01-13T09:00:00").toISOString(),
                    end: new Date("2026-01-13T09:20:00").toISOString(),
                    title: "New Patient Consultation",
                  },
                  {
                    start: new Date("2026-01-13T09:30:00").toISOString(),
                    end: new Date("2026-01-13T10:00:00").toISOString(),
                    title: "Follow-up Review",
                  },
                  {
                    start: new Date("2026-01-13T17:00:00").toISOString(),
                    end: new Date("2026-01-13T18:00:00").toISOString(),
                    title: "Teleconsultation",
                  },

                  // ───────── Wednesday (Jan 14) ─────────
                  {
                    start: new Date("2026-01-14T10:00:00").toISOString(),
                    end: new Date("2026-01-14T11:00:00").toISOString(),
                    title: "OPD Session",
                  },
                  {
                    start: new Date("2026-01-14T15:00:00").toISOString(),
                    end: new Date("2026-01-14T15:30:00").toISOString(),
                    title: "Lab Report Review",
                  },

                  // ───────── Thursday (Jan 15) ─────────
                  {
                    start: new Date("2026-01-15T09:00:00").toISOString(),
                    end: new Date("2026-01-15T09:15:00").toISOString(),
                    title: "Emergency Buffer",
                  },
                  {
                    start: new Date("2026-01-15T09:15:00").toISOString(),
                    end: new Date("2026-01-15T10:00:00").toISOString(),
                    title: "General Consultation",
                  },

                  // ───────── Friday (Jan 16) ─────────
                  {
                    start: new Date("2026-01-16T11:00:00").toISOString(),
                    end: new Date("2026-01-16T12:00:00").toISOString(),
                    title: "Procedure Follow-up",
                  },

                  // ───────── Saturday (Jan 17) ─────────
                  {
                    start: new Date("2026-01-17T10:00:00").toISOString(),
                    end: new Date("2026-01-17T11:00:00").toISOString(),
                    title: "Weekend OPD",
                  },

                  // ───────── Sunday (Jan 18) ─────────
                  {
                    start: new Date("2026-01-18T17:00:00").toISOString(),
                    end: new Date("2026-01-18T18:00:00").toISOString(),
                    title: "Evening Teleconsultation",
                  },
                ]}
              />
            </div>
          }
        />
        <Route element={<ProtectedRoute allowedRoles={[roles.USER]} />}>
          {/* <Route path="/home" element={<UHomePage />} /> */}
          <Route path="/appointments" element={<UAppointmentsListingPage />} />
          <Route path="/appointments/:id" element={<UViewAppointmentPage />} />
          <Route path="/reports/:id" element={<UViewReportPage />} />
          <Route path="/prescriptions/:id" element={<UViewPrescriptionPage />} />
          <Route path="/medical-records" element={<UMedicalRecordsPage />} />

          <Route
            path="/appointments/:id/confirmation"
            element={<UAppointmentConfirmationPage />}
          />
          <Route
            path="/wallet/topup/:id/confirmation"
            element={<UWalletConfirmationPage />}
          />
          <Route path="/wallet" element={<UWalletPage />} />
          <Route path="/settings" element={<USettingsPage />} />
          <Route
            path="/doctors/:doctorId/book/:slotId"
            element={<UAppointmentBookingPage />}
          />
          <Route element={<ProfileCreationProtectedRoute />}>
            <Route
              path="/profile-creation"
              element={<UProfileCreationLayout />}
            />
          </Route>
        </Route>
        <Route element={<LoginPageProtectedRoute />}>
          <Route path="/login" element={<ULoginPage />} />
          <Route path="/signup" element={<USignupPage />} />
          <Route
            path="/forgot-password"
            element={<AuthForgotPasswordLayout role="user" />}
          />
        </Route>
        <Route path="/profile" element={<UProfilePage />} />
      </Route>
      <Route
        path="/consultation/:appointmentId"
        element={<UConsultationRoomPage />}
      />
    </Routes>
  );
}

export default UserRoute;
