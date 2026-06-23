// import React from 'react'
import { Routes, Route } from "react-router";
import ADashboard from "../pages/admin/ADashboard";
import ASpecializationManagement from "../pages/admin/ASpecializationManagement";
import ProtectedRoute from "../utils/ProtectedRoute";
import { roles } from "../constants/roles";
import ALoginPage from "../pages/admin/ALoginPage";
import AUserManagement from "../pages/admin/AUserManagement";
import ADoctorManagement from "../pages/admin/ADoctorManagement";
import AOrganizationManagementPage from "../pages/admin/AOrganizationManagementPage";
import AViewOrganizationPage from "../pages/admin/AViewOrganizationPage";
import AViewUserPage from "../pages/admin/AViewUserPage";
import AViewDoctorPage from "../pages/admin/AViewDoctorPage";
import AWalletsPage from "../pages/admin/AWalletsPage";
import AViewWalletPage from "../pages/admin/AViewWalletPage";
import ATransactionsPage from "../pages/admin/ATransactionsPage";
import AViewTransactionPage from "../pages/admin/AViewTransactionPage";
import AAppointmentsPage from "../pages/admin/AAppointmentsPage";
import AViewAppointmentPage from "../pages/admin/AViewAppointmentPage";
import APayoutsPage from "../pages/admin/APayoutsPage";
import AViewPayoutPage from "../pages/admin/AViewPayoutPage";
import AReviewsManagementPage from "../pages/admin/AReviewsManagementPage";
import ADisputesPage from "../pages/admin/ADisputesPage";
import AViewDisputePage from "../pages/admin/AViewDisputePage";

import LoginPageProtectedRoute from "../utils/LoginPageProtectedRoute";

function AdminRoute() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={[roles.ADMIN, roles.NONE]} />}>
        <Route element={<LoginPageProtectedRoute />}>
          <Route path="" element={<ALoginPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={[roles.ADMIN]} />}>
          <Route path="home" element={<ADashboard />} />
          <Route
            path="/specialization-management"
            element={<ASpecializationManagement />}
          />
          <Route path="/user-management" element={<AUserManagement />} />
          <Route path="/user-management/:id" element={<AViewUserPage />} />
          <Route path="/doctor-management" element={<ADoctorManagement />} />
          <Route path="/doctor-management/:id" element={<AViewDoctorPage />} />
          <Route path="/hospital-management" element={<AOrganizationManagementPage />} />
          <Route path="/hospital-management/:id" element={<AViewOrganizationPage />} />
          <Route path="/wallets" element={<AWalletsPage />} />
          <Route path="/wallets/:id" element={<AViewWalletPage />} />
          <Route path="/transactions" element={<ATransactionsPage />} />
          <Route path="/transactions/:id" element={<AViewTransactionPage />} />
          <Route path="/appointments" element={<AAppointmentsPage />} />
          <Route path="/appointments/:id" element={<AViewAppointmentPage />} />
          <Route path="/payouts" element={<APayoutsPage />} />
          <Route path="/payouts/:id" element={<AViewPayoutPage />} />
          <Route path="/reviews" element={<AReviewsManagementPage />} />
          <Route path="/disputes" element={<ADisputesPage />} />
          <Route path="/disputes/:id" element={<AViewDisputePage />} />
        </Route>
      </Route>
      {/* <Route path="/user-management" element={<AUserManagement />} /> */}
    </Routes>
  );
}

export default AdminRoute;
