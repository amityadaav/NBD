import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageHospitals from "./pages/admin/ManageHospitals";
import ManageDoctors from "./pages/admin/ManageDoctors";
import ManagePatients from "./pages/admin/ManagePatients";
import ManageAppointments from "./pages/admin/ManageAppointments";
import AdminSettings from "./pages/admin/AdminSettings";

// Hospital pages
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalProfile from "./pages/hospital/HospitalProfile";
import HospitalDoctors from "./pages/hospital/HospitalDoctors";
import HospitalAppointments from "./pages/hospital/HospitalAppointments";
import HospitalSettings from "./pages/hospital/HospitalSettings";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import MyAppointments from "./pages/user/MyAppointments";
import MyProfile from "./pages/user/MyProfile";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import HospitalLayout from "./layouts/HospitalLayout";
import UserLayout from "./layouts/UserLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="hospitals" element={<ManageHospitals />} />
          <Route path="doctors" element={<ManageDoctors />} />
          <Route path="patients" element={<ManagePatients />} />
          <Route path="appointments" element={<ManageAppointments />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Hospital Admin Dashboard */}
        <Route path="/hospital" element={<HospitalLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<HospitalDashboard />} />
          <Route path="profile" element={<HospitalProfile />} />
          <Route path="doctors" element={<HospitalDoctors />} />
          <Route path="appointments" element={<HospitalAppointments />} />
          <Route path="settings" element={<HospitalSettings />} />
        </Route>

        {/* Patient Dashboard */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>

        {/* 404 - Not Found */}
        <Route
          path="*"
          element={
            <div style={{ padding: "40px", textAlign: "center" }}>
              <h1>404 - Page Not Found</h1>
              <a href="/login">Go to Login</a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;