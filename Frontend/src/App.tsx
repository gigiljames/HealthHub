import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import UserRoute from "./routes/UserRoute.tsx";
import AdminRoute from "./routes/AdminRoute.tsx";
import HospitalRoute from "./routes/HospitalRoute.tsx";
import DoctorRoute from "./routes/DoctorRoute.tsx";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <>
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}
      >
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<UserRoute />} />
            <Route path="/admin/*" element={<AdminRoute />} />
            <Route path="/doctor/*" element={<DoctorRoute />} />
            <Route path="/hospital/*" element={<HospitalRoute />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
