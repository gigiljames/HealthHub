import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import UserRoute from "./routes/UserRoute.tsx";
import AdminRoute from "./routes/AdminRoute.tsx";
import HospitalRoute from "./routes/HospitalRoute.tsx";
import DoctorRoute from "./routes/DoctorRoute.tsx";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useSelector } from "react-redux";
import type { RootState } from "./state/store";
import { useEffect } from "react";

function App() {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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
