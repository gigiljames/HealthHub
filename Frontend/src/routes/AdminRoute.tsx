// import React from 'react'
import { Routes, Route } from "react-router";
import ADashboard from "../pages/admin/ADashboard";
import ASpecializationManagement from "../pages/admin/ASpecializationManagement";
import ProtectedRoute from "../utils/ProtectedRoute";
import { roles } from "../constants/roles";
import ALoginPage from "../pages/admin/ALoginPage";
import AUserManagement from "../pages/admin/AUserManagement";
import AHospitalManagement from "../pages/admin/AHospitalManagement";
import ADoctorManagement from "../pages/admin/ADoctorManagement";
import AWalletsPage from "../pages/admin/AWalletsPage";
import AViewWalletPage from "../pages/admin/AViewWalletPage";
import ATransactionsPage from "../pages/admin/ATransactionsPage";
import AViewTransactionPage from "../pages/admin/AViewTransactionPage";
import AAppointmentsPage from "../pages/admin/AAppointmentsPage";
import AViewAppointmentPage from "../pages/admin/AViewAppointmentPage";
import APayoutsPage from "../pages/admin/APayoutsPage";
import AViewPayoutPage from "../pages/admin/AViewPayoutPage";

function AdminRoute() {
  return (
    <Routes>
      <Route path="" element={<ALoginPage />} />
      <Route element={<ProtectedRoute allowedRoles={[roles.ADMIN]} />}>
        <Route path="home" element={<ADashboard />} />
        <Route
          path="/specialization-management"
          element={<ASpecializationManagement />}
        />
        <Route path="/user-management" element={<AUserManagement />} />
        <Route path="/doctor-management" element={<ADoctorManagement />} />
        <Route path="/hospital-management" element={<AHospitalManagement />} />
        <Route path="/wallets" element={<AWalletsPage />} />
        <Route path="/wallets/:id" element={<AViewWalletPage />} />
        <Route path="/transactions" element={<ATransactionsPage />} />
        <Route path="/transactions/:id" element={<AViewTransactionPage />} />
        <Route path="/appointments" element={<AAppointmentsPage />} />
        <Route path="/appointments/:id" element={<AViewAppointmentPage />} />
        <Route path="/payouts" element={<APayoutsPage />} />
        <Route path="/payouts/:id" element={<AViewPayoutPage />} />
      </Route>
      {/* <Route path="/user-management" element={<AUserManagement />} /> */}
    </Routes>
  );
}

export default AdminRoute;
