// import React from 'react'
import { Routes, Route } from "react-router";
import ADashboard from "../pages/admin/ADashboard";
import ASpecializationManagement from "../pages/admin/ASpecializationManagement";

function AdminRoute() {
  return (
    <Routes>
      <Route path="" element={<div>Doctor Landing Page</div>} />
      <Route path="login" element={<div>Doctor Login</div>} />
      <Route path="home" element={<ADashboard />} />
      <Route
        path="specialization-management"
        element={<ASpecializationManagement />}
      />
    </Routes>
  );
}

export default AdminRoute;
