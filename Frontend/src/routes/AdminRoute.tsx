// import React from 'react'
import { Routes, Route } from "react-router";
import ADashboard from "../pages/admin/ADashboard";
import ASpecializationManagement from "../pages/admin/ASpecializationManagement";
import ProtectedRoute from "../utils/ProtectedRoute";
import { roles } from "../constants/roles";
import ALoginPage from "../pages/admin/ALoginPage";
import AUserManagement from "../pages/admin/AUserManagement";
import AHospitalManagement from "../pages/admin/AHospitalManagement";

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
        <Route path="/hospital-management" element={<AHospitalManagement />} />
      </Route>
    </Routes>
  );
}

export default AdminRoute;
